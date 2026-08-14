/* Computrax — izometrická 3D scéna počítača.
   Kreslí sa celá z JS do #scene. Postup riadi story.js cez window.setProgress(0..1).
   Bez externých závislostí. */

(function(){
'use strict';

/* --- integrácia do stránky: ovládacie prvky demo verzie sú voliteľné --- */
function __stub(){
  return { value:0, valueAsNumber:-1, textContent:'', disabled:false,
           addEventListener:function(){}, classList:{add:function(){},remove:function(){}} };
}
function __el(id){ return document.getElementById(id) || __stub(); }


/* ============================================================
   Computrax hero — candidate D
   Fixed isometric projection, one inline SVG, gradient-shaded.
   Light key from upper-left-front, cool fill from the right.
   ============================================================ */

var NS  = 'http://www.w3.org/2000/svg';
var K   = 0.8660254037844386;      // cos(30°)

/* case dimensions in "case units" (x = depth back->front, y = width far->near, z = height) */
var D = 210, W = 112, H = 286;
/* screen anchor of case origin (0,0,0) */
var SCX = 323, SCY = 372;
/* scene pivot used for scale / skew */
var PVX = 280, PVY = 330;

var RM = false;
try { RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

/* ---------- projection helpers ---------- */
function iso(x,y,z){ return [ SCX - K*x + K*y, SCY + 0.5*x + 0.5*y - z ]; }
function n(v){ return Math.round(v*100)/100; }
function P(p){ return n(p[0])+','+n(p[1]); }
function quad(a,b,c,d){ return 'M'+P(a)+'L'+P(b)+'L'+P(c)+'L'+P(d)+'Z'; }
/* top face at height z */
function fTop(x,y,z,dx,dy){ return quad(iso(x,y,z),iso(x+dx,y,z),iso(x+dx,y+dy,z),iso(x,y+dy,z)); }
/* face at constant x (points to screen-left / case front) */
function fFrt(x,y,z,dy,dz){ return quad(iso(x,y,z+dz),iso(x,y+dy,z+dz),iso(x,y+dy,z),iso(x,y,z)); }
/* face at constant y (points to screen-right / glass side) */
function fSid(x,y,z,dx,dz){ return quad(iso(x,y,z+dz),iso(x+dx,y,z+dz),iso(x+dx,y,z),iso(x,y,z)); }
function line(a,b){ return 'M'+P(a)+'L'+P(b); }

/* circle-on-plane matrices: draw unit-radius shapes, let the matrix place them */
function mTop(x,y,z,r){ var c=iso(x,y,z); return 'matrix('+n(-K*r)+','+n(0.5*r)+','+n(K*r)+','+n(0.5*r)+','+n(c[0])+','+n(c[1])+')'; }
function mFrt(x,y,z,r){ var c=iso(x,y,z); return 'matrix('+n(K*r)+','+n(0.5*r)+',0,'+n(-r)+','+n(c[0])+','+n(c[1])+')'; }
function mSid(x,y,z,r){ var c=iso(x,y,z); return 'matrix('+n(-K*r)+','+n(0.5*r)+',0,'+n(-r)+','+n(c[0])+','+n(c[1])+')'; }

/* ---------- dom helpers ---------- */
function el(tag,attrs,parent){
  var e=document.createElementNS(NS,tag);
  if(attrs) for(var k in attrs) e.setAttribute(k,attrs[k]);
  if(parent) parent.appendChild(e);
  return e;
}
function pa(d,attrs,parent){ attrs=attrs||{}; attrs.d=d; return el('path',attrs,parent); }
function A(e,name,val){
  var c=e.__c||(e.__c={});
  if(c[name]!==val){ c[name]=val; e.setAttribute(name,val); }
}

/* ============================================================
   DEFS — every surface gets a gradient. Nothing is a flat fill.
   ============================================================ */
document.getElementById('defs').innerHTML = [
/* --- chassis, anodised graphite/navy --- */
'<linearGradient id="gTopP" x1="0.08" y1="0" x2="0.78" y2="1">',
 '<stop offset="0" stop-color="#61748f"/><stop offset=".30" stop-color="#465873"/>',
 '<stop offset=".68" stop-color="#313e55" stop-opacity="1"/><stop offset="1" stop-color="#222c3f"/>',
'</linearGradient>',
'<linearGradient id="gFrontP" x1="0.06" y1="0" x2="0.9" y2="1">',
 '<stop offset="0" stop-color="#465771"/><stop offset=".32" stop-color="#33425a"/>',
 '<stop offset=".72" stop-color="#222c3d"/><stop offset="1" stop-color="#161d29"/>',
'</linearGradient>',
'<linearGradient id="gSideP" x1="0.1" y1="0" x2="0.85" y2="1">',
 '<stop offset="0" stop-color="#313d52"/><stop offset=".38" stop-color="#212b3b"/>',
 '<stop offset=".78" stop-color="#161d29"/><stop offset="1" stop-color="#0e131c"/>',
'</linearGradient>',
/* specular streak, laid over the front bezel */
'<linearGradient id="gSpec" x1="0.02" y1="0.1" x2="0.55" y2="0.95">',
 '<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>',
 '<stop offset=".34" stop-color="#cfe9ff" stop-opacity=".10"/>',
 '<stop offset=".44" stop-color="#ffffff" stop-opacity=".19"/>',
 '<stop offset=".54" stop-color="#cfe9ff" stop-opacity=".08"/>',
 '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>',
'</linearGradient>',
'<linearGradient id="gSpecTop" x1="0" y1="0" x2="1" y2="0.7">',
 '<stop offset="0" stop-color="#ffffff" stop-opacity=".16"/>',
 '<stop offset=".30" stop-color="#ffffff" stop-opacity=".05"/>',
 '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>',
'</linearGradient>',
/* rim / bevel light */
'<linearGradient id="gRim" x1="0" y1="0" x2="1" y2="1">',
 '<stop offset="0" stop-color="#dff6ff" stop-opacity=".85"/>',
 '<stop offset=".55" stop-color="#9fd6f5" stop-opacity=".45"/>',
 '<stop offset="1" stop-color="#7fb6dd" stop-opacity=".12"/>',
'</linearGradient>',
/* glass side window */
'<linearGradient id="gGlass" x1="0.05" y1="0" x2="0.9" y2="1">',
 '<stop offset="0" stop-color="#d8ecff" stop-opacity=".26"/>',
 '<stop offset=".34" stop-color="#7ea6c6" stop-opacity=".10"/>',
 '<stop offset=".70" stop-color="#16202e" stop-opacity=".30"/>',
 '<stop offset="1" stop-color="#080d15" stop-opacity=".46"/>',
'</linearGradient>',
'<linearGradient id="gGlassFrame" x1="0" y1="0" x2="0.7" y2="1">',
 '<stop offset="0" stop-color="#586c88"/><stop offset=".5" stop-color="#2b3648"/>',
 '<stop offset="1" stop-color="#141b26"/>',
'</linearGradient>',
'<linearGradient id="gStreak" x1="0" y1="0" x2="1" y2="0">',
 '<stop offset="0" stop-color="#ffffff" stop-opacity="0"/>',
 '<stop offset=".45" stop-color="#ffffff" stop-opacity=".17"/>',
 '<stop offset=".55" stop-color="#ffffff" stop-opacity=".17"/>',
 '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/>',
'</linearGradient>',
/* interior */
'<linearGradient id="gInFar" x1="0.1" y1="0" x2="0.8" y2="1">',
 '<stop offset="0" stop-color="#1a2434"/><stop offset=".55" stop-color="#111926"/><stop offset="1" stop-color="#080d15"/>',
'</linearGradient>',
'<linearGradient id="gInBack" x1="0" y1="0" x2="0.6" y2="1">',
 '<stop offset="0" stop-color="#121a27"/><stop offset="1" stop-color="#060a11"/>',
'</linearGradient>',
'<linearGradient id="gInFloor" x1="0" y1="0" x2="0.5" y2="1">',
 '<stop offset="0" stop-color="#0c121c"/><stop offset="1" stop-color="#05080e"/>',
'</linearGradient>',
'<linearGradient id="gAO" x1="0" y1="0" x2="0" y2="1">',
 '<stop offset="0" stop-color="#000000" stop-opacity="0"/>',
 '<stop offset="1" stop-color="#000000" stop-opacity=".62"/>',
'</linearGradient>',
'<linearGradient id="gAOup" x1="0" y1="0" x2="0" y2="1">',
 '<stop offset="0" stop-color="#000000" stop-opacity=".55"/>',
 '<stop offset="1" stop-color="#000000" stop-opacity="0"/>',
'</linearGradient>',
/* pcb */
'<linearGradient id="gPcb" x1="0.1" y1="0" x2="0.8" y2="1">',
 '<stop offset="0" stop-color="#1b2f42"/><stop offset=".5" stop-color="#132434"/><stop offset="1" stop-color="#0b1622"/>',
'</linearGradient>',
'<linearGradient id="gPcbEdge" x1="0" y1="0" x2="0" y2="1">',
 '<stop offset="0" stop-color="#2c4459"/><stop offset="1" stop-color="#0f1d2a"/>',
'</linearGradient>',
/* aluminium heatsink */
'<linearGradient id="gAlTop" x1="0.05" y1="0" x2="0.85" y2="1">',
 '<stop offset="0" stop-color="#a9bcd2"/><stop offset=".45" stop-color="#7387a1"/><stop offset="1" stop-color="#4a5a72"/>',
'</linearGradient>',
'<linearGradient id="gAlFrt" x1="0" y1="0" x2="0.9" y2="1">',
 '<stop offset="0" stop-color="#8698b0"/><stop offset=".5" stop-color="#5b6d86"/><stop offset="1" stop-color="#39465b"/>',
'</linearGradient>',
'<linearGradient id="gAlSid" x1="0.1" y1="0" x2="0.9" y2="1">',
 '<stop offset="0" stop-color="#63758d"/><stop offset=".5" stop-color="#45536a"/><stop offset="1" stop-color="#2b3546"/>',
'</linearGradient>',
/* ram heat spreader */
'<linearGradient id="gRamF" x1="0.05" y1="0" x2="0.8" y2="1">',
 '<stop offset="0" stop-color="#546986"/>',
 '<stop offset=".45" stop-color="#37455c"/><stop offset="1" stop-color="#1d2534"/>',
'</linearGradient>',
'<linearGradient id="gRamT" x1="0" y1="0" x2="1" y2="1">',
 '<stop offset="0" stop-color="#8ea3bd"/><stop offset="1" stop-color="#3f4d64"/>',
'</linearGradient>',
/* gpu */
'<linearGradient id="gGpuT" x1="0.05" y1="0" x2="0.85" y2="1">',
 '<stop offset="0" stop-color="#4a5a74"/><stop offset=".4" stop-color="#2f3b51"/><stop offset="1" stop-color="#1b2331"/>',
'</linearGradient>',
'<linearGradient id="gGpuS" x1="0" y1="0" x2="0.8" y2="1">',
 '<stop offset="0" stop-color="#3a4760"/><stop offset=".55" stop-color="#232d3e"/><stop offset="1" stop-color="#131a25"/>',
'</linearGradient>',
/* psu / drives */
'<linearGradient id="gPsuT" x1="0.05" y1="0" x2="0.8" y2="1">',
 '<stop offset="0" stop-color="#3b4860"/><stop offset=".5" stop-color="#252f41"/><stop offset="1" stop-color="#151c28"/>',
'</linearGradient>',
'<linearGradient id="gPsuS" x1="0" y1="0" x2="0.8" y2="1">',
 '<stop offset="0" stop-color="#2a3446"/><stop offset=".55" stop-color="#1a2230"/><stop offset="1" stop-color="#0e131c"/>',
'</linearGradient>',
'<linearGradient id="gSsdT" x1="0" y1="0" x2="0.9" y2="1">',
 '<stop offset="0" stop-color="#5d6f8a"/><stop offset=".5" stop-color="#3d4a61"/><stop offset="1" stop-color="#28313f"/>',
'</linearGradient>',
'<linearGradient id="gSsdLabel" x1="0" y1="0" x2="0.8" y2="1">',
 '<stop offset="0" stop-color="#f2f6fb"/><stop offset="1" stop-color="#c2cede"/>',
'</linearGradient>',
/* plinth / base */
'<linearGradient id="gPlinth" x1="0" y1="0" x2="0.6" y2="1">',
 '<stop offset="0" stop-color="#131a26"/><stop offset="1" stop-color="#05080d"/>',
'</linearGradient>',
/* fans */
'<linearGradient id="gFanH" x1="0" y1="0" x2="1" y2="1">',
 '<stop offset="0" stop-color="#465470"/>',
 '<stop offset=".5" stop-color="#263144"/>',
 '<stop offset="1" stop-color="#10161f"/>',
'</linearGradient>',
'<linearGradient id="gBlade" x1="0" y1="0" x2="1" y2="1">',
 '<stop offset="0" stop-color="#54637d"/><stop offset=".55" stop-color="#2e3a4e"/><stop offset="1" stop-color="#182030"/>',
'</linearGradient>',
'<radialGradient id="gHub" cx="0.35" cy="0.3" r="0.85">',
 '<stop offset="0" stop-color="#6b7c96"/><stop offset="1" stop-color="#1b2331"/>',
'</radialGradient>',
/* brand accent */
'<linearGradient id="gAccent" x1="0" y1="0" x2="1" y2="1">',
 '<stop offset="0" stop-color="#00E8FB"/><stop offset="1" stop-color="#007BFF"/>',
'</linearGradient>',
'<linearGradient id="gAccentSoft" x1="0" y1="0" x2="1" y2="1">',
 '<stop offset="0" stop-color="#00E8FB" stop-opacity=".85"/>',
 '<stop offset=".6" stop-color="#3fa9ff" stop-opacity=".55"/>',
 '<stop offset="1" stop-color="#007BFF" stop-opacity=".25"/>',
'</linearGradient>',
/* shadow + glow */
'<radialGradient id="gShadow" cx="0.5" cy="0.5" r="0.5">',
 '<stop offset="0" stop-color="#0B1220" stop-opacity=".46"/>',
 '<stop offset=".45" stop-color="#0B1220" stop-opacity=".26"/>',
 '<stop offset=".78" stop-color="#0B1220" stop-opacity=".07"/>',
 '<stop offset="1" stop-color="#0B1220" stop-opacity="0"/>',
'</radialGradient>',
'<radialGradient id="gShadowCore" cx="0.5" cy="0.5" r="0.5">',
 '<stop offset="0" stop-color="#0B1220" stop-opacity=".40"/>',
 '<stop offset=".55" stop-color="#0B1220" stop-opacity=".16"/>',
 '<stop offset="1" stop-color="#0B1220" stop-opacity="0"/>',
'</radialGradient>',
'<radialGradient id="gGlow" cx="0.5" cy="0.5" r="0.5">',
 '<stop offset="0" stop-color="#8df3ff" stop-opacity=".55"/>',
 '<stop offset=".28" stop-color="#00E8FB" stop-opacity=".33"/>',
 '<stop offset=".58" stop-color="#007BFF" stop-opacity=".16"/>',
 '<stop offset="1" stop-color="#007BFF" stop-opacity="0"/>',
'</radialGradient>',
'<radialGradient id="gPool" cx="0.5" cy="0.5" r="0.5">',
 '<stop offset="0" stop-color="#00E8FB" stop-opacity=".42"/>',
 '<stop offset=".45" stop-color="#1f9dff" stop-opacity=".18"/>',
 '<stop offset="1" stop-color="#007BFF" stop-opacity="0"/>',
'</radialGradient>',
/* x-ray scan sweep */
'<linearGradient id="gScan" x1="0" y1="0" x2="0" y2="1">',
 '<stop offset="0" stop-color="#00E8FB" stop-opacity="0"/>',
 '<stop offset=".30" stop-color="#00E8FB" stop-opacity=".16"/>',
 '<stop offset=".46" stop-color="#7ff2ff" stop-opacity=".46"/>',
 '<stop offset=".50" stop-color="#eafeff" stop-opacity=".82"/>',
 '<stop offset=".54" stop-color="#7ff2ff" stop-opacity=".42"/>',
 '<stop offset=".72" stop-color="#1f9dff" stop-opacity=".13"/>',
 '<stop offset="1" stop-color="#007BFF" stop-opacity="0"/>',
'</linearGradient>',
'<radialGradient id="gXrayLift" cx="0.5" cy="0.45" r="0.62">',
 '<stop offset="0" stop-color="#7fe8ff" stop-opacity=".16"/>',
 '<stop offset="1" stop-color="#007BFF" stop-opacity="0"/>',
'</radialGradient>',
/* led */
'<radialGradient id="gLedOff" cx="0.35" cy="0.3" r="0.8">',
 '<stop offset="0" stop-color="#3a475c"/><stop offset="1" stop-color="#121822"/>',
'</radialGradient>',
'<radialGradient id="gLedOn" cx="0.4" cy="0.35" r="0.85">',
 '<stop offset="0" stop-color="#ecfff4"/><stop offset=".35" stop-color="#5df29a"/><stop offset="1" stop-color="#22C55E"/>',
'</radialGradient>',
'<radialGradient id="gLedHalo" cx="0.5" cy="0.5" r="0.5">',
 '<stop offset="0" stop-color="#22C55E" stop-opacity=".55"/>',
 '<stop offset="1" stop-color="#22C55E" stop-opacity="0"/>',
'</radialGradient>'
].join('');

/* ============================================================
   BUILD
   ============================================================ */
var stage = document.getElementById('stage');
var R = {};

/* --- floor fx (shadow + glow) --- */
var gFx = el('g',{id:'fx'},stage);
R.glow = el('ellipse',{cx:284,cy:318,rx:212,ry:196,fill:'url(#gGlow)',opacity:'0'},gFx);
var shadowG = el('g',{id:'shadow'},gFx);
var shadowRot = el('g',{transform:'rotate(-9 282 452)'},shadowG);
R.pool = el('ellipse',{cx:282,cy:456,rx:178,ry:60,fill:'url(#gPool)',opacity:'0'},shadowRot);
el('ellipse',{cx:282,cy:452,rx:168,ry:74,fill:'url(#gShadow)'},shadowRot);
el('ellipse',{cx:280,cy:459,rx:112,ry:40,fill:'url(#gShadowCore)'},shadowRot);
R.shadow = shadowG;

/* --- machine --- */
var machine = el('g',{id:'machine'},stage);
var lyrBack  = el('g',{id:'lyrBack'},machine);
var lyrParts = el('g',{id:'lyrParts'},machine);
var lyrShell = el('g',{id:'lyrShell'},machine);
var lyrWire  = el('g',{id:'lyrWire',opacity:'0'},machine);
var lyrScan  = el('g',{id:'lyrScan',opacity:'0',style:'mix-blend-mode:screen'},machine);
var lyrChk   = el('g',{id:'lyrChk'},machine);
var lyrLbl   = el('g',{id:'lyrLbl',opacity:'0'},stage);

/* silhouette hull (used for clipping the sweep and the x-ray lift) */
var hull = 'M'+P(iso(0,0,H))+'L'+P(iso(0,W,H))+'L'+P(iso(0,W,0))+'L'+P(iso(D,W,0))
         + 'L'+P(iso(D,0,0))+'L'+P(iso(D,0,H))+'Z';
var cp = el('clipPath',{id:'clipHull',clipPathUnits:'userSpaceOnUse'},document.getElementById('defs'));
pa(hull,{},cp);

/* ------------------------------------------------------------
   1. INTERIOR (far wall, back wall, floor) + plinth
   ------------------------------------------------------------ */
(function interior(){
  var g = lyrBack;
  /* base plinth, recessed -> gives an overhang + AO line */
  pa(fTop(8,8,0,194,96),{fill:'url(#gPlinth)'},g);
  pa(fFrt(202,8,-9,96,9),{fill:'#0a0f16'},g);
  pa(fSid(8,104,-9,194,9),{fill:'#06090f'},g);

  /* interior surfaces */
  pa(fSid(0,0,0,D,H),{fill:'url(#gInFar)'},g);      /* motherboard tray wall (far) */
  pa(fFrt(0,0,0,W,H),{fill:'url(#gInBack)'},g);     /* back wall */
  pa(fTop(0,0,0,D,W),{fill:'url(#gInFloor)'},g);    /* floor */

  /* ambient occlusion: floor -> walls */
  pa(fSid(0,0.4,0,D,72),{fill:'url(#gAO)'},g);
  pa(fFrt(0.4,0,0,W,72),{fill:'url(#gAO)'},g);
  pa(fSid(0,0.4,H-56,D,56),{fill:'url(#gAOup)',opacity:'.5'},g);
  /* corner AO where the two walls meet */
  pa(fSid(0,0.6,0,26,H),{fill:'#000',opacity:'.28'},g);

  /* cable-management grommets on the tray */
  [[24,44],[24,150],[24,232]].forEach(function(v){
    pa(fSid(v[0],0.8,v[1],16,44),{fill:'#05080d',opacity:'.85'},g);
    pa(fSid(v[0],1.0,v[1]+41,16,3),{fill:'#3a4a61',opacity:'.30'},g);
  });
  /* faint horizontal machining lines on the tray */
  for(var i=0;i<7;i++){
    pa(fSid(30,1.0,44+i*34,150,1),{fill:'#3a4a61',opacity:'.16'},g);
  }
})();

/* ------------------------------------------------------------
   2. INTERNAL PARTS
   ------------------------------------------------------------ */
function fan(parent, mat, opt){
  opt = opt||{};
  var g  = el('g',{transform:mat},parent);
  el('circle',{r:1.06,fill:'url(#gFanH)'},g);
  el('circle',{r:1.06,fill:'none',stroke:'#0a0f16','stroke-width':0.05,opacity:'.8'},g);
  el('circle',{r:0.93,fill:'#070b11'},g);
  el('circle',{r:0.93,fill:'url(#gSpecTop)',opacity:'.5'},g);
  var b = el('g',{transform:'rotate(0)'},g);
  for(var i=0;i<7;i++){
    el('path',{
      d:'M0.24,-0.09C0.52,-0.31 0.82,-0.30 0.92,-0.05C0.79,0.25 0.50,0.31 0.21,0.15Z',
      fill:'url(#gBlade)','fill-opacity':0.94,
      transform:'rotate('+n(i*51.4286)+')'
    },b);
  }
  el('circle',{r:0.31,fill:'url(#gHub)'},g);
  el('circle',{r:0.31,fill:'none',stroke:'#080d13','stroke-width':0.035},g);
  if(opt.ring!==false){
    el('circle',{r:1.0,fill:'none',stroke:'#7f93ae','stroke-width':0.035,opacity:'.45'},g);
  }
  return b;
}

var accents = {};          /* per-part accent groups (light up when scanned / alive) */
function accGroup(part,parent){ var g=el('g',{opacity:'.12'},parent); accents[part]=g; return g; }

/* ---- motherboard ---- */
var gMobo = el('g',{},lyrParts);
(function mobo(){
  var g=gMobo, x=26,y=6,z=66,dx=160,dy=5,dz=186;
  pa(fSid(x,y+dy,z,dx,dz),{fill:'url(#gPcb)'},g);
  pa(fTop(x,y,z+dz,dx,dy),{fill:'url(#gPcbEdge)'},g);
  pa(fFrt(x+dx,y,z,dy,dz),{fill:'#0d1b28'},g);
  /* traces */
  for(var i=0;i<9;i++){
    pa(fSid(x+8,y+dy+0.2,z+12+i*19,dx-18,1.1),{fill:'#2f5f7a',opacity:'.20'},g);
  }
  for(var j=0;j<7;j++){
    pa(fSid(x+16+j*20,y+dy+0.2,z+10,1.1,dz-24),{fill:'#2f5f7a',opacity:'.14'},g);
  }
  /* PCIe + chipset */
  pa(fSid(44,y+dy+0.4,100,124,5),{fill:'#101c2a'},g);
  pa(fSid(44,y+dy+0.6,101,124,2.2),{fill:'#5a7fa0',opacity:'.55'},g);
  pa(fSid(44,y+dy+0.4,72,96,4),{fill:'#101c2a'},g);
  pa(fSid(96,y+dy+0.4,140,54,26),{fill:'url(#gAlSid)',opacity:'.9'},g);   /* chipset heatsink */
  pa(fSid(96,y+dy+0.8,163,54,2),{fill:'#7f93ae',opacity:'.35'},g);
  /* rear I/O shield */
  pa(fSid(26,y+dy+0.4,196,26,52),{fill:'#1a2434'},g);
  for(var q=0;q<4;q++) pa(fSid(29,y+dy+0.8,202+q*12,20,7),{fill:'#05080d'},g);
  /* screws */
  [[34,80],[34,244],[178,80],[178,244]].forEach(function(s){
    el('circle',{r:1,transform:mSid(s[0],y+dy+0.6,s[1],3.1),fill:'#8b9ab1',opacity:'.5'},g);
    el('circle',{r:1,transform:mSid(s[0],y+dy+0.9,s[1],1.5),fill:'#0a0f16',opacity:'.8'},g);
  });
  /* AO shadow cast by the GPU onto the board */
  pa(fSid(48,y+dy+1.0,84,132,20),{fill:'url(#gAOup)',opacity:'.55'},g);
  var a=accGroup('mobo',g);
  pa(fSid(30,y+dy+1.2,248,152,2.4),{fill:'url(#gAccent)'},a);
})();

/* ---- PSU ---- */
var gPsu = el('g',{},lyrParts);
(function psu(){
  var g=gPsu, x=18,y=12,z=16,dx=96,dy=88,dz=48;
  pa(fTop(x,y,z+dz,dx,dy),{fill:'url(#gPsuT)'},g);
  pa(fFrt(x+dx,y,z,dy,dz),{fill:'url(#gPsuS)'},g);
  pa(fSid(x,y+dy,z,dx,dz),{fill:'url(#gPsuS)'},g);
  /* bevel highlight along the top edges */
  pa(fTop(x,y,z+dz,dx,3),{fill:'#8ea3bd',opacity:'.16'},g);
  pa(fSid(x,y+dy,z+dz-3,dx,3),{fill:'#7f93ae',opacity:'.18'},g);
  /* vent slots on the visible side */
  for(var i=0;i<7;i++){
    pa(fSid(x+8+i*12,y+dy+0.3,z+8,6,dz-16),{fill:'#05080d',opacity:'.85'},g);
    pa(fSid(x+8+i*12,y+dy+0.5,z+8,1.4,dz-16),{fill:'#7f93ae',opacity:'.12'},g);
  }
  /* label on the front face */
  pa(fFrt(x+dx+0.4,y+16,z+14,54,22),{fill:'#0c121b',opacity:'.9'},g);
  pa(fFrt(x+dx+0.6,y+21,z+22,26,3),{fill:'#8ea3bd',opacity:'.35'},g);
  pa(fFrt(x+dx+0.6,y+21,z+16,40,2),{fill:'#8ea3bd',opacity:'.18'},g);
  /* shroud top specular */
  pa(fTop(x,y,z+dz+0.2,dx,dy),{fill:'url(#gSpecTop)',opacity:'.5'},g);
  var a=accGroup('psu',g);
  pa(fSid(x,y+dy+0.6,z+dz-6,dx,3.2),{fill:'url(#gAccent)'},a);
})();

/* ---- SSD ---- */
var gSsd = el('g',{},lyrParts);
(function ssd(){
  var g=gSsd, x=34,y=22,z=66,dx=62,dy=44,dz=6;
  pa(fTop(x,y,z+dz,dx,dy),{fill:'url(#gSsdT)'},g);
  pa(fFrt(x+dx,y,z,dy,dz),{fill:'#232c3a'},g);
  pa(fSid(x,y+dy,z,dx,dz),{fill:'#1b2330'},g);
  pa(fTop(x+7,y+8,z+dz+0.3,44,28),{fill:'url(#gSsdLabel)',opacity:'.92'},g);
  pa(fTop(x+11,y+13,z+dz+0.6,26,3),{fill:'#0B1220',opacity:'.55'},g);
  pa(fTop(x+11,y+19,z+dz+0.6,17,2.4),{fill:'#0B1220',opacity:'.30'},g);
  [[x+3,y+3],[x+dx-4,y+3],[x+3,y+dy-4],[x+dx-4,y+dy-4]].forEach(function(s){
    el('circle',{r:1,transform:mTop(s[0],s[1],z+dz+0.4,2.1),fill:'#0a0f16',opacity:'.55'},g);
  });
  var a=accGroup('ssd',g);
  pa(fTop(x+7,y+38,z+dz+0.7,44,2.6),{fill:'url(#gAccent)'},a);
})();

/* ---- GPU ---- */
var gGpu = el('g',{},lyrParts);
(function gpu(){
  var g=gGpu, x=48,y=11,z=104,dx=132,dy=42,dz=30;
  /* backplate (top face) */
  pa(fTop(x,y,z+dz,dx,dy),{fill:'url(#gGpuT)'},g);
  pa(fFrt(x+dx,y,z,dy,dz),{fill:'url(#gGpuS)'},g);
  pa(fSid(x,y+dy,z,dx,dz),{fill:'url(#gGpuS)'},g);
  /* backplate machining: long slots + a diagonal cut */
  for(var i=0;i<6;i++){
    pa(fTop(x+12+i*20,y+6,z+dz+0.3,10,30),{fill:'#0d131d',opacity:'.55'},g);
    pa(fTop(x+12+i*20,y+6,z+dz+0.5,10,1.4),{fill:'#8ea3bd',opacity:'.12'},g);
  }
  pa(fTop(x,y,z+dz+0.6,dx,dy),{fill:'url(#gSpecTop)',opacity:'.7'},g);
  /* bevel + rim on the top-near edge */
  pa(fTop(x,y+dy-3,z+dz+0.7,dx,3),{fill:'#93a8c2',opacity:'.22'},g);
  /* shroud edge detail on the near side */
  pa(fSid(x+6,y+dy+0.3,z+6,dx-12,7),{fill:'#0a0f16',opacity:'.7'},g);
  pa(fSid(x+6,y+dy+0.5,z+21,dx-12,2),{fill:'#8ea3bd',opacity:'.16'},g);
  /* power connector on the front end */
  pa(fFrt(x+dx+0.4,y+8,z+8,20,12),{fill:'#0a0f16',opacity:'.9'},g);
  var a=accGroup('gpu',g);
  pa(fSid(x+6,y+dy+0.7,z+13,dx-12,3.4),{fill:'url(#gAccent)'},a);
  pa(fTop(x+96,y+8,z+dz+0.9,26,3.2),{fill:'url(#gAccent)'},a);
})();

/* ---- CPU cooler ---- */
var gCpu = el('g',{},lyrParts);
(function cpu(){
  var g=gCpu, x=56,y=11,z=158,dx=62,dy=64,dz=88;
  /* fin stack */
  pa(fTop(x,y,z+dz,dx,dy),{fill:'url(#gAlTop)'},g);
  pa(fFrt(x+dx,y,z,dy,dz),{fill:'url(#gAlFrt)'},g);
  pa(fSid(x,y+dy,z,dx,dz),{fill:'url(#gAlSid)'},g);
  /* fin edges on the top plate */
  for(var i=0;i<13;i++){
    pa(fTop(x+3+i*4.5,y+2,z+dz+0.3,1.8,dy-4),{fill:'#28334a',opacity:'.55'},g);
  }
  /* fin edges on the near side */
  for(var j=0;j<19;j++){
    pa(fSid(x+2,y+dy+0.3,z+4+j*4.4,dx-4,1.9),{fill:'#161d2a',opacity:'.62'},g);
    pa(fSid(x+2,y+dy+0.5,z+4+j*4.4,dx-4,0.6),{fill:'#c3d3e6',opacity:'.14'},g);
  }
  /* base block */
  pa(fFrt(x+dx,y+4,z-10,dy-14,12),{fill:'#3b4a61'},g);
  pa(fSid(x+4,y+dy-10,z-10,dx-8,12),{fill:'#2a3446'},g);
  /* heatpipes poking out of the top plate */
  [0,1,2,3].forEach(function(i){
    el('circle',{r:1,transform:mTop(x+10+i*13,y+14,z+dz+1.2,4.2),fill:'#c9b28f',opacity:'.75'},g);
    el('circle',{r:1,transform:mTop(x+10+i*13,y+14,z+dz+1.4,2.6),fill:'#8f7a5a',opacity:'.7'},g);
  });
  /* top cap with brand strip */
  pa(fTop(x+4,y+30,z+dz+1.6,dx-8,26),{fill:'#1e2734'},g);
  pa(fTop(x+4,y+30,z+dz+1.9,dx-8,26),{fill:'url(#gSpecTop)',opacity:'.6'},g);
  /* fan on the face pointing at the case front */
  fanCpu = fan(g, mFrt(x+dx+1.2, y+32, z+44, 26));
  /* rim light along the top-left silhouette edge */
  pa(line(iso(x,y,z+dz),iso(x+dx,y,z+dz)),{stroke:'url(#gRim)','stroke-width':1.3,fill:'none',opacity:'.55'},g);
  var a=accGroup('cpu',g);
  pa(fTop(x+8,y+36,z+dz+2.2,dx-16,3.4),{fill:'url(#gAccent)'},a);
  pa(fFrt(x+dx+1.4,y+8,z+18,48,2.6),{fill:'url(#gAccent)'},a);
})();
var fanCpu;

/* ---- RAM ---- */
var gRam = el('g',{},lyrParts);
(function ram(){
  var g=gRam, y=11, z=150, dy=24, dz=84;
  var aAll = accGroup('ram',null);
  for(var i=0;i<4;i++){
    var x = 126 + i*9, dx = 6;
    pa(fFrt(x+dx,y,z,dy,dz),{fill:'url(#gRamF)'},g);      /* broad face of the stick */
    pa(fTop(x,y,z+dz,dx,dy),{fill:'url(#gRamT)'},g);
    pa(fSid(x,y+dy,z,dx,dz),{fill:'#1a2231'},g);
    /* heat-spreader fins */
    for(var k=0;k<5;k++){
      pa(fFrt(x+dx+0.3,y+4,z+14+k*13,dy-8,4),{fill:'#0f1723',opacity:'.55'},g);
      pa(fFrt(x+dx+0.5,y+4,z+14+k*13,dy-8,1.2),{fill:'#b6c7de',opacity:'.14'},g);
    }
    /* pcb foot below the spreader */
    pa(fFrt(x+dx-0.2,y+2,z-8,dy-6,9),{fill:'#0f2231'},g);
    /* bevel */
    pa(fFrt(x+dx+0.4,y,z+dz-3,dy,3),{fill:'#cfe0f5',opacity:'.20'},g);
  }
  g.appendChild(aAll);
  for(var m=0;m<4;m++){
    var xx = 126 + m*9;
    pa(fTop(xx,y+2,z+dz+0.5,6,dy-4),{fill:'url(#gAccent)'},aAll);
  }
})();

/* ---- cables ---- */
var gCab = el('g',{},lyrParts);
(function cables(){
  var g=gCab;
  function bundle(a,b,c1,c2,w){
    var d='M'+P(a)+'C'+P(c1)+' '+P(c2)+' '+P(b);
    pa(d,{fill:'none',stroke:'#05080d','stroke-width':w,'stroke-linecap':'round',opacity:'.95'},g);
    pa(d,{fill:'none',stroke:'#28344a','stroke-width':w*0.62,'stroke-linecap':'round'},g);
    pa(d,{fill:'none',stroke:'#7f93ae','stroke-width':w*0.16,'stroke-linecap':'round',opacity:'.35',transform:'translate(-0.8,-1.1)'},g);
  }
  bundle(iso(58,66,64), iso(178,16,152), iso(96,70,88), iso(176,26,116), 7);
  bundle(iso(38,52,64), iso(52,16,244),  iso(24,52,150), iso(30,20,216), 5.5);
  bundle(iso(84,60,64), iso(150,16,104), iso(120,58,74), iso(150,30,88), 4.5);
})();

/* ---- front intake fans (behind the bezel mesh) ---- */
var gFrontFans = el('g',{},lyrParts);
var fanF1 = fan(gFrontFans, mFrt(196,56,84,30));
var fanF2 = fan(gFrontFans, mFrt(196,56,170,30));

/* ------------------------------------------------------------
   3. SHELL — front bezel, glass side panel, top panel
   ------------------------------------------------------------ */
var gFront = el('g',{},lyrShell);
var frontSolid = el('g',{},gFront);      /* fades out during x-ray */
var frontAlways = el('g',{},gFront);
(function bezel(){
  var g=frontSolid;
  pa(fFrt(D,0,0,W,H),{fill:'url(#gFrontP)'},g);
  /* recessed mesh well */
  pa(fFrt(D,12,24,88,222),{fill:'#06090f','fill-opacity':'.58'},g);
  /* slats */
  for(var i=0;i<36;i++){
    var z = 26 + i*6;
    if(z+3.2>244) break;
    pa(fFrt(D,13,z,86,3.1),{fill:'#2c3a4f'},g);
    pa(fFrt(D,13,z+2.5,86,0.7),{fill:'#000',opacity:'.5'},g);
    pa(fFrt(D,13,z,86,0.7),{fill:'#8ea3bd',opacity:'.13'},g);
  }
  /* mesh inner shadow */
  pa(fFrt(D+0.2,12,24,88,26),{fill:'url(#gAOup)',opacity:'.85'},g);
  /* I/O strip */
  pa(fFrt(D+0.1,16,252,80,20),{fill:'#141b26'},g);
  for(var q=0;q<4;q++) pa(fFrt(D+0.3,22+q*15,258,10,8),{fill:'#05080d'},g);
  for(var q2=0;q2<4;q2++) pa(fFrt(D+0.5,22+q2*15,264,10,1.4),{fill:'#5f7characters',opacity:'0'},g);
  for(var q3=0;q3<4;q3++) pa(fFrt(D+0.5,22+q3*15,264,10,1.4),{fill:'#5f7device',opacity:'0'},g);
  for(var q4=0;q4<4;q4++) pa(fFrt(D+0.5,22+q4*15,264,10,1.4),{fill:'#6f83a0',opacity:'.5'},g);
  /* bevels: bright top edge and near vertical edge */
  pa(fFrt(D+0.2,0,H-4,W,4),{fill:'#a9c2dc',opacity:'.30'},g);
  pa(fFrt(D+0.2,W-4,0,4,H),{fill:'#8ba3c0',opacity:'.20'},g);
  pa(fFrt(D+0.2,0,0,4,H),{fill:'#7f95b3',opacity:'.10'},g);
  /* specular streak */
  pa(fFrt(D+0.3,0,0,W,H),{fill:'url(#gSpec)'},g);
  /* bottom trim */
  pa(fFrt(D+0.2,0,0,W,10),{fill:'#0c1119',opacity:'.75'},g);

  /* --- always-on bits: power button, LED, accent bar --- */
  var h=frontAlways;
  el('circle',{r:1,transform:mFrt(D+0.6,88,262,9),fill:'#1a2231'},h);
  el('circle',{r:1,transform:mFrt(D+0.8,88,262,7.4),fill:'#2b3purple',opacity:'0'},h);
  el('circle',{r:1,transform:mFrt(D+0.8,88,262,7.4),fill:'#33405a'},h);
  el('circle',{r:1,transform:mFrt(D+1.0,88,262,7.4),fill:'url(#gSpecTop)',opacity:'.8'},h);
  el('circle',{r:1,transform:mFrt(D+1.1,88,262,3.0),fill:'#0a0f16',opacity:'.6'},h);
  /* power LED */
  R.ledHalo = el('circle',{r:1,transform:mFrt(D+0.5,66,262,16),fill:'url(#gLedHalo)',opacity:'0'},h);
  el('circle',{r:1,transform:mFrt(D+0.7,66,262,4.4),fill:'url(#gLedOff)'},h);
  R.ledOn = el('circle',{r:1,transform:mFrt(D+0.9,66,262,4.0),fill:'url(#gLedOn)',opacity:'0'},h);
  /* slim brand light bar down the near edge of the bezel */
  R.bar = pa(fFrt(D+0.7,W-8,28,3.6,206),{fill:'url(#gAccent)',opacity:'.10'},h);
})();

var gGlass = el('g',{},lyrShell);
(function glass(){
  var g=gGlass;
  var gx=8, gz=14, gdx=194, gdz=258;
  /* the pane */
  R.pane = pa(fSid(gx,W,gz,gdx,gdz),{fill:'url(#gGlass)'},g);
  /* clipped reflection streaks */
  var cid='clipGlass';
  var cpg = el('clipPath',{id:cid,clipPathUnits:'userSpaceOnUse'},document.getElementById('defs'));
  pa(fSid(gx,W,gz,gdx,gdz),{},cpg);
  var sg = el('g',{'clip-path':'url(#'+cid+')'},g);
  el('rect',{x:150,y:60,width:56,height:520,fill:'url(#gStreak)',transform:'rotate(24 150 60)',opacity:'.9'},sg);
  el('rect',{x:236,y:40,width:22,height:520,fill:'url(#gStreak)',transform:'rotate(24 236 40)',opacity:'.7'},sg);
  R.streaks = sg;
  /* frame */
  pa(fSid(0,W,0,D,H),{fill:'none',stroke:'#0a0f16','stroke-width':1.2,opacity:'.8'},g);
  pa(fSid(0,W+0.2,H-14,D,14),{fill:'url(#gSideP)'},g);
  pa(fSid(0,W+0.2,0,D,14),{fill:'url(#gSideP)'},g);
  pa(fSid(0,W+0.2,0,10,H),{fill:'url(#gSideP)'},g);
  pa(fSid(D-10,W+0.2,0,10,H),{fill:'url(#gSideP)'},g);
  /* frame bevel highlights */
  pa(fSid(0,W+0.4,H-3,D,3),{fill:'#a9c2dc',opacity:'.26'},g);
  pa(fSid(D-3,W+0.4,0,3,H),{fill:'#8ba3c0',opacity:'.16'},g);
  /* thumb screws */
  [[16,26],[16,H-26],[D-16,26],[D-16,H-26]].forEach(function(s){
    el('circle',{r:1,transform:mSid(s[0],W+0.6,s[1],4.2),fill:'#4b5a72'},g);
    el('circle',{r:1,transform:mSid(s[0],W+0.8,s[1],2.4),fill:'#151c27'},g);
    el('circle',{r:1,transform:mSid(s[0]-0.6,W+1.0,s[1]+0.8,1.5),fill:'#b9cbe2',opacity:'.35'},g);
  });
})();

var gTop = el('g',{},lyrShell);
var topSolid = el('g',{},gTop);
var topAlways = el('g',{},gTop);
(function topPanel(){
  var g=topSolid;
  pa(fTop(0,0,H,D,W),{fill:'url(#gTopP)'},g);
  pa(fTop(0,0,H+0.2,D,W),{fill:'url(#gSpecTop)',opacity:'.9'},g);
  /* recessed vent well */
  pa(fTop(16,10,H-0.4,178,92),{fill:'#080d14',opacity:'.82'},g);
  /* vent slats around the fans */
  for(var i=0;i<20;i++){
    pa(fTop(20+i*8.6,12,H-0.2,3.2,88),{fill:'#2a3purple',opacity:'0'},g);
    pa(fTop(20+i*8.6,12,H-0.2,3.2,88),{fill:'#2f3d52',opacity:'.9'},g);
  }
  /* edge bevels */
  pa(fTop(0,0,H+0.4,D,4),{fill:'#c3d8ef',opacity:'.22'},g);
  pa(fTop(0,0,H+0.4,4,W),{fill:'#b6cde6',opacity:'.17'},g);
  pa(fTop(D-4,0,H+0.4,4,W),{fill:'#0a0f16',opacity:'.30'},g);
  pa(fTop(0,W-4,H+0.4,D,4),{fill:'#0a0f16',opacity:'.22'},g);
  /* rim light along the two far top edges */
  pa(line(iso(0,0,H),iso(D,0,H)),{stroke:'url(#gRim)','stroke-width':1.6,fill:'none'},g);
  pa(line(iso(0,0,H),iso(0,W,H)),{stroke:'url(#gRim)','stroke-width':1.6,fill:'none'},g);
})();
var fanT1 = fan(topAlways, mTop(76,56,H-2,33));
var fanT2 = fan(topAlways, mTop(148,56,H-2,33));

/* silhouette line — keeps it crisp on the light background */
pa(hull,{fill:'none',stroke:'#0B1220','stroke-width':1.3,opacity:'.42','stroke-linejoin':'round'},lyrShell);
pa(line(iso(D,W,0),iso(D,W,H)),{stroke:'url(#gRim)','stroke-width':1.5,fill:'none',opacity:'.55'},lyrShell);

/* ------------------------------------------------------------
   4. X-RAY WIREFRAME + SWEEP + CHECKS
   ------------------------------------------------------------ */
(function wire(){
  var g=lyrWire, s={stroke:'#5fe4ff','stroke-width':1.1,fill:'none','stroke-linecap':'round'};
  var E=[
    [[0,0,0],[D,0,0]],[[0,W,0],[D,W,0]],[[0,0,H],[D,0,H]],[[0,W,H],[D,W,H]],
    [[0,0,0],[0,W,0]],[[D,0,0],[D,W,0]],[[0,0,H],[0,W,H]],[[D,0,H],[D,W,H]],
    [[0,0,0],[0,0,H]],[[D,0,0],[D,0,H]],[[0,W,0],[0,W,H]],[[D,W,0],[D,W,H]]
  ];
  E.forEach(function(e){
    var o={}; for(var k in s) o[k]=s[k];
    o.opacity = (e[0][1]===0&&e[1][1]===0) ? '.45' : '.75';
    pa(line(iso(e[0][0],e[0][1],e[0][2]),iso(e[1][0],e[1][1],e[1][2])),o,g);
  });
  /* x-ray brightening of the interior volume */
  R.lift = pa(hull,{fill:'url(#gXrayLift)',opacity:'.9'},g);
})();

(function sweep(){
  var g = el('g',{'clip-path':'url(#clipHull)'},lyrScan);
  R.band = el('rect',{x:128,y:-105,width:304,height:210,fill:'url(#gScan)'},g);
  R.bandLine = el('rect',{x:128,y:-1.1,width:304,height:2.2,fill:'#f2feff',opacity:'.55'},g);
  R.sweepG = g;
})();

var CHK = [
  {id:'cpu', x:300, y:224},
  {id:'ram', x:228, y:250},
  {id:'gpu', x:268, y:318},
  {id:'ssd', x:312, y:352},
  {id:'psu', x:330, y:392}
];
var SWEEP_TOP = 78, SWEEP_BOT = 548;
CHK.forEach(function(c){
  var g = el('g',{transform:'translate('+c.x+','+c.y+')',opacity:'0'},lyrChk);
  var s = el('g',{transform:'scale(1)'},g);
  el('circle',{r:17,fill:'url(#gLedHalo)',opacity:'.55'},s);
  el('circle',{r:11.5,fill:'#0f1a15',opacity:'.55'},s);
  el('circle',{r:11.5,fill:'none',stroke:'#22C55E','stroke-width':2.2},s);
  el('path',{d:'M-4.6,0.3 L-1.4,3.6 L5,-3.4',fill:'none',stroke:'#7cf0a6','stroke-width':2.5,
             'stroke-linecap':'round','stroke-linejoin':'round'},s);
  c.g=g; c.s=s;
  c.t=(c.y-SWEEP_TOP)/(SWEEP_BOT-SWEEP_TOP);
});

/* ------------------------------------------------------------
   5. EXPLODED LABELS (static geometry, only faded in/out)
   ------------------------------------------------------------ */
var PARTS = [
  {id:'psu',  g:gPsu,  c:[314.3,393.0],  off:[  4, 142], d:0.030, d2:0.008, label:'Zdroj',    lbl:[318,620]},
  {id:'mobo', g:gMobo, c:[238.6,270.3],  off:[-18, -10], d:0.052, d2:0.000, label:null},
  {id:'ssd',  g:gSsd,  c:[304.8,357.5],  off:[104,  70], d:0.024, d2:0.014, label:'Úložisko', lbl:[412,382]},
  {id:'gpu',  g:gGpu,  c:[251.1,325.5],  off:[-40,  72], d:0.016, d2:0.020, label:'Grafika',  lbl:[185,480]},
  {id:'cpu',  g:gCpu,  c:[284.9,235.0],  off:[ 52, -60], d:0.020, d2:0.026, label:'Procesor', lbl:[337,282]},
  {id:'ram',  g:gRam,  c:[219.5,262.8],  off:[200,  44], d:0.034, d2:0.030, label:'RAM',      lbl:[438,208]}
];
var SHELLS = [
  {id:'glass', g:gGlass, off:[186,  72], d:0.000, d2:0.050},
  {id:'front', g:gFront, off:[-118, 96], d:0.008, d2:0.046},
  {id:'top',   g:gTop,   off:[  0,-150], d:0.014, d2:0.042}
];
var CABLE_OFF = [-18,-10];

PARTS.forEach(function(p){
  if(!p.label) return;
  var ex = p.c[0]+p.off[0], ey = p.c[1]+p.off[1];
  var g = el('g',{},lyrLbl);
  pa('M'+n(p.lbl[0])+','+n(p.lbl[1])+'L'+n(ex)+','+n(ey),
     {stroke:'#0B1220','stroke-width':1.1,'stroke-opacity':'.30','stroke-dasharray':'3 3',fill:'none'},g);
  el('circle',{cx:ex,cy:ey,r:3,fill:'#007BFF','fill-opacity':'.9'},g);
  var w = p.label.length*8.9 + 40, h = 32;
  el('rect',{x:n(p.lbl[0]-w/2),y:n(p.lbl[1]-h/2),width:n(w),height:h,rx:16,
             fill:'#ffffff','fill-opacity':'.95',stroke:'#007BFF','stroke-opacity':'.30','stroke-width':1.1},g);
  el('circle',{cx:n(p.lbl[0]-w/2+15),cy:n(p.lbl[1]),r:3.6,fill:'url(#gAccent)'},g);
  var t = el('text',{x:n(p.lbl[0]+7),y:n(p.lbl[1]+5.6),'text-anchor':'middle','class':'lblTxt'},g);
  t.textContent = p.label;
  p.lg = g;
});

/* --- odraz na podlahe: zrkadlova kopia sceny, ktora sa strati do stratena --- */
var sceneEl = document.getElementById('scene');
if(!RM){
  document.getElementById('defs').insertAdjacentHTML('beforeend',
    '<linearGradient id="gOdrazFade" x1="0" y1="452" x2="0" y2="628" gradientUnits="userSpaceOnUse">'+
    '<stop offset="0" stop-color="#ffffff" stop-opacity="0.62"/>'+
    '<stop offset="0.55" stop-color="#ffffff" stop-opacity="0.16"/>'+
    '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>'+
    '<mask id="mOdraz" maskUnits="userSpaceOnUse" x="0" y="452" width="560" height="180">'+
    '<rect x="0" y="452" width="560" height="180" fill="url(#gOdrazFade)"/></mask>');

  var odrazG = el('g',{'class':'odraz',mask:'url(#mOdraz)',opacity:'0.22','aria-hidden':'true'});
  sceneEl.insertBefore(odrazG, stage);
  var zrkadlo = el('g',{transform:'translate(0,904) scale(1,-1)'},odrazG);
  var pouzi = document.createElementNS(NS,'use');
  pouzi.setAttribute('href','#stage');
  zrkadlo.appendChild(pouzi);
  R.odraz = odrazG;
}
var poslednaSat = -1;

/* ============================================================
   TIMELINE
   ============================================================ */
function cl(v){ return v<0?0:(v>1?1:v); }
function seg(p,a,b){ return cl((p-a)/(b-a)); }
function eio(t){ return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }
function eo(t){ return 1-Math.pow(1-t,3); }
function esine(t){ return -(Math.cos(Math.PI*t)-1)/2; }
function eob(t){ var c1=1.24,c3=c1+1; return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2); }

var spin = 0;
var tilt = {x:0,y:0,dx:0,dy:0,tx:0,ty:0,tdx:0,tdy:0};
var curP = 0, dim = 1;
var lastPhase = '';
var phaseEl = __el('phase');

function render(p, time){
  var xray   = eio(seg(p,0.245,0.315)) * (1-eio(seg(p,0.500,0.575)));
  var sweepT = esine(seg(p,0.270,0.475));
  var sweepA = eio(seg(p,0.252,0.290)) * (1-eio(seg(p,0.452,0.500)));
  var envel  = eio(seg(p,0.490,0.630)) * (1-eio(seg(p,0.760,0.900)));
  var alive  = eo(seg(p,0.855,0.975)) * dim;
  var glowT  = eio(seg(p,0.830,1.000)) * dim;
  var lblT   = eio(seg(p,0.545,0.605)) * (1-eio(seg(p,0.712,0.756)));

  /* --- mŕtvy → živý: v pokoji je stroj odfarbený, postupne naberá farbu --- */
  var pulz  = RM ? 0 : Math.exp(-Math.pow((p-0.876)/0.020,2));
  var zivot = cl(0.12 + 0.26*seg(p,0.00,0.24) + 0.62*seg(p,0.26,0.52) + 0.10*seg(p,0.86,1.00));
  var jas   = 0.94 + 0.06*seg(p,0.10,0.52) + 0.03*seg(p,0.86,1.00) + pulz*0.06;
  if(Math.abs(zivot-poslednaSat) > 0.004){
    poslednaSat = zivot;
    sceneEl.style.filter = 'saturate('+n(zivot)+') brightness('+n(jas)+')';
  }

  /* --- scene transform: float, tilt, drag, explode pull-back --- */
  var fy = RM ? 0 : (Math.sin(time*0.85)*3.2 + Math.sin(time*0.41)*1.3);
  var fx = RM ? 0 : Math.sin(time*0.55)*1.6;
  var par = tilt.x + tilt.dx;
  var tx  = Math.max(-24,Math.min(24, par*10 + fx));
  var ty  = tilt.y*5.5 + fy - envel*4;
  var sk  = Math.max(-3.4,Math.min(3.4, tilt.x*0.55 + tilt.dx*1.7));
  var dych = RM ? 0 : Math.sin(time*0.62)*0.0048*(1-seg(p,0.20,0.46));
  var sc  = 1 - envel*0.22 + dych;
  A(stage,'transform','translate('+n(PVX+tx)+','+n(PVY+ty)+') scale('+n(sc)+') skewY('+n(sk)+') translate('+(-PVX)+','+(-PVY)+')');

  /* parallax between layers -> reads as depth / rotation */
  A(lyrBack ,'transform','translate('+n(-par*4.2)+','+n(-tilt.y*2.0)+')');
  A(lyrParts,'transform','translate('+n(par*1.4)+','+n(tilt.y*0.4)+')');
  A(lyrShell,'transform','translate('+n(par*6.6)+','+n(tilt.y*2.6)+')');
  A(lyrWire ,'transform','translate('+n(par*3.0)+','+n(tilt.y*1.2)+')');
  A(lyrChk  ,'transform','translate('+n(par*3.0)+','+n(tilt.y*1.2)+')');

  /* --- explode offsets --- */
  function amt(o){
    return eob(seg(p,0.500+o.d,0.652+o.d)) * (1 - eio(seg(p,0.752+o.d2,0.886+o.d2)));
  }
  var i,o,a;
  for(i=0;i<PARTS.length;i++){
    o=PARTS[i]; a=amt(o);
    A(o.g,'transform','translate('+n(o.off[0]*a)+','+n(o.off[1]*a)+')');
  }
  for(i=0;i<SHELLS.length;i++){
    o=SHELLS[i]; a=amt(o);
    A(o.g,'transform','translate('+n(o.off[0]*a)+','+n(o.off[1]*a)+')');
  }
  var ca = amt(PARTS[1]);
  A(gCab,'transform','translate('+n(CABLE_OFF[0]*ca)+','+n(CABLE_OFF[1]*ca)+')');
  A(gCab,'opacity',n(1-cl(envel*1.6)));
  A(gFrontFans,'opacity',n(0.45+0.55*Math.max(xray,envel)));

  /* --- x-ray --- */
  A(frontSolid,'opacity',n(1-xray*0.88));
  A(topSolid  ,'opacity',n(1-xray*0.86));
  A(R.pane    ,'opacity',n(1-xray*0.72));
  A(R.streaks ,'opacity',n(1-xray*0.85));
  A(lyrWire   ,'opacity',n(xray*0.85));
  A(lyrScan   ,'opacity',n(sweepA));

  /* --- sweep --- */
  var sy = SWEEP_TOP + (SWEEP_BOT-SWEEP_TOP)*sweepT;
  A(R.sweepG,'transform','translate(0,'+n(sy)+')');

  /* --- per-part scan state: check badges + accent lighting --- */
  var chkFade = 1 - eio(seg(p,0.500,0.552));
  for(i=0;i<CHK.length;i++){
    var c = CHK[i];
    var lit = cl((sweepT - c.t)*8);
    var pop = cl((sweepT - c.t)*5.5);
    A(c.g,'opacity',n(lit*chkFade*sweepAOr(sweepA)));
    A(c.s,'transform','scale('+n(0.55+0.45*eob(pop))+')');
    var acc = accents[c.id];
    if(acc) A(acc,'opacity',n(Math.max(0.12, Math.max(lit*0.9, alive))));
  }
  if(accents.mobo) A(accents.mobo,'opacity',n(Math.max(0.10, Math.max(cl((sweepT-0.40)*6)*0.8, alive))));

  /* --- reborn --- */
  A(R.ledOn,'opacity',n(alive));
  A(R.ledHalo,'opacity',n(Math.min(1, alive*0.9 + pulz*0.75)));
  A(R.bar,'opacity',n(Math.min(1, 0.10+0.85*Math.max(alive, xray*0.35) + pulz*0.55)));
  A(R.glow,'opacity',n(glowT*0.95));
  A(R.glow,'transform','translate('+n(tx*0.4)+','+n(ty*0.35-glowT*6)+') scale('+n(0.86+glowT*0.16)+')');
  A(R.pool,'opacity',n(glowT*0.85));

  /* --- shadow reacts to motion / explode --- */
  var shs = 1 - envel*0.16 - (fy*0.004);
  A(R.shadow,'transform','translate('+n(tx*0.55)+','+n(Math.max(0,fy)*0.10)+') scale('+n(shs)+') translate('+n(-282*(1-shs)/shs*0)+',0)');
  A(R.shadow,'opacity',n(0.95 - envel*0.30 - Math.max(0,fy)*0.012));

  /* --- popisky: každý prilieta vtedy, keď sa jeho diel oddelí --- */
  A(lyrLbl,'opacity',n(lblT > 0 ? 1 : 0));
  for(i=0;i<PARTS.length;i++){
    o = PARTS[i];
    if(!o.lg) continue;
    var lt = eio(seg(p, 0.545+o.d*2.1, 0.605+o.d*2.1)) *
             (1 - eio(seg(p, 0.712+o.d2, 0.756+o.d2)));
    A(o.lg,'opacity',n(lt));
    A(o.lg,'transform','translate('+n((1-lt)*6)+','+n((1-lt)*14)+')');
  }

  /* --- fans --- */
  if(!RM){
    var spd = 0.35 + alive*4.2 + xray*1.1;
    spin = (spin + spd) % 360;
    var rot='rotate('+n(spin)+')', rot2='rotate('+n(-spin*0.82)+')';
    A(fanT1,'transform',rot); A(fanT2,'transform',rot2);
    A(fanF1,'transform',rot2); A(fanF2,'transform',rot);
    if(fanCpu) A(fanCpu,'transform',rot);
  }

  /* --- phase caption --- */
  var ph = p<0.25?'IDLE':(p<0.5?'SCAN':(p<0.75?'EXPLODE':'REBORN'));
  if(ph!==lastPhase){ lastPhase=ph; phaseEl.textContent=ph; }
}
function sweepAOr(v){ return v; }

/* ============================================================
   DRIVER
   ============================================================ */
var TOTAL = 15000, HOLD = 2800, FADE = 1000, CYCLE = TOTAL + HOLD;
var autoplay = false;   /* postup riadi scroll stránky */
var t0 = (typeof performance!=='undefined'? performance.now() : Date.now());
var scrub = __el('scrub');
var playBtn = __el('play');
var rafId = 0;

function frame(now){
  rafId = requestAnimationFrame(frame);
  /* pointer smoothing */
  tilt.x += (tilt.tx - tilt.x)*0.085;
  tilt.y += (tilt.ty - tilt.y)*0.085;
  tilt.dx += (tilt.tdx - tilt.dx)*0.10;
  tilt.dy += (tilt.tdy - tilt.dy)*0.10;
  if(!dragging){ tilt.tdx *= 0.972; tilt.tdy *= 0.972; }

  if(autoplay){
    var e = (now - t0) % CYCLE;
    curP = e < TOTAL ? e/TOTAL : 1;
    dim  = e < (CYCLE-FADE) ? 1 : 1 - (e-(CYCLE-FADE))/FADE;
    var sv = Math.round(curP*1000);
    if(scrub.valueAsNumber !== sv) scrub.value = sv;
  }
  render(curP, now/1000);
}

/* pointer */
var wrap = document.getElementById('wrap');
var dragging=false, lastPX=0, lastPY=0;
if(!RM){
  wrap.addEventListener('pointermove',function(e){
    var r = wrap.getBoundingClientRect();
    tilt.tx = ((e.clientX-r.left)/r.width)*2-1;
    tilt.ty = ((e.clientY-r.top)/r.height)*2-1;
    if(dragging){
      tilt.tdx = Math.max(-1.9,Math.min(1.9, tilt.tdx + (e.clientX-lastPX)*0.0075));
      tilt.tdy = Math.max(-1.2,Math.min(1.2, tilt.tdy + (e.clientY-lastPY)*0.0045));
      lastPX=e.clientX; lastPY=e.clientY;
    }
  });
  wrap.addEventListener('pointerleave',function(){ tilt.tx=0; tilt.ty=0; });
  wrap.addEventListener('pointerdown',function(e){
    dragging=true; lastPX=e.clientX; lastPY=e.clientY;
    wrap.classList.add('dragging');
    try{ wrap.setPointerCapture(e.pointerId); }catch(err){}
  });
  function endDrag(e){
    dragging=false; wrap.classList.remove('dragging');
    try{ wrap.releasePointerCapture(e.pointerId); }catch(err){}
  }
  wrap.addEventListener('pointerup',endDrag);
  wrap.addEventListener('pointercancel',endDrag);
}

/* controls */
scrub.addEventListener('input',function(){
  setAutoplay(false);
  setProgress(scrub.valueAsNumber/1000);
});
playBtn.addEventListener('click',function(){
  setAutoplay(!autoplay);
});

/* ---------- public API ---------- */
function nowSec(){ return (typeof performance!=='undefined'? performance.now() : Date.now())/1000; }

function setProgress(p){
  p = Number(p);
  if(!isFinite(p)) return;
  curP = cl(p);
  dim = 1;
  autoplay = false;
  playBtn.textContent = 'Prehrať';
  var sv = Math.round(curP*1000);
  if(scrub.valueAsNumber !== sv) scrub.value = sv;
  render(curP, nowSec());
}
function setAutoplay(on){
  on = !!on;
  if(on === autoplay) { if(!on) return; }
  autoplay = on;
  playBtn.textContent = on ? 'Pauza' : 'Prehrať';
  if(on){
    if(RM) { autoplay=false; playBtn.textContent='Prehrať'; return; }
    t0 = (typeof performance!=='undefined'? performance.now() : Date.now()) - curP*TOTAL;
    if(!rafId) rafId = requestAnimationFrame(frame);
  }
}
window.setProgress = setProgress;
window.setAutoplay = setAutoplay;

/* ---------- start ---------- */
if(RM){
  autoplay = false;
  playBtn.textContent = 'Prehrať';
  playBtn.disabled = true;
  curP = 1; dim = 1;
  scrub.value = 1000;
  render(1, 0);
}else{
  rafId = requestAnimationFrame(frame);
}

})();
