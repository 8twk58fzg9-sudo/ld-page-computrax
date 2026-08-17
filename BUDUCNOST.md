# Čo spraviť, keď sa niečo zmení

Zoznam konkrétnych krokov pre situácie, ktoré na tomto webe skôr či neskôr
nastanú. Každý bod hovorí, ktorý súbor otvoriť a čo v ňom zmeniť.

---

## 1. Pridať ďalší repasovaný počítač

Otvor `produkty.js`, skopíruj jeden blok `{ ... }` a prepíš hodnoty.
Fotku ulož do `assets/` — na výšku, ideálne 760 px vysokú, biele pozadie.

Nič iné meniť netreba. HTML sa neupravuje.

---

## 2. Pridať NOVÝ (nerepasovaný) počítač

Toto **nie je** len o pridaní dlaždice. Celý web dnes tvrdí veci, ktoré pri
novom tovare neplatia. Pred pridaním prvého nového kusu treba prejsť tieto
miesta:

| Kde | Čo tam dnes je | Prečo to prekáža |
|---|---|---|
| `index.html` — pás pod hero | „100 % kusov testovaných“ | Nový tovar sa nerozoberá ani netestuje kus po kuse |
| `index.html` — karta 01 | „kde má repasovaný stroj kozmetické stopy“ | Nový tovar kozmetické stopy nemá |
| `index.html` — hero text | „Vyhľadávame vyradené firemné a herné počítače“ | Neplatí pre nový tovar |
| `o-nas.html` | celý príbeh o repase a ekológii | Netýka sa nového tovaru |
| `kontrola.html` | „Čo kontrolujeme pred odoslaním“ | Iný rozsah pri novom tovare |
| `kontrola.html` | „záruka 24 mesiacov“ | Pri novom tovare platí záruka výrobcu, býva iná |
| `pocitace.html` | „Stav repasovaného počítača“ | Nový tovar stav nemá |
| pätička všetkých stránok | „Repasované počítače pripravené na Windows 11“ | Prestane platiť ako popis celej ponuky |

**Odporúčaný postup:** nechať tvrdenia platiť len tam, kde sa naozaj vzťahujú —
teda naviazať ich na štítok „Repasovaný“, nie na celý web. Napríklad „100 %
repasovaných kusov testovaných“ namiesto „100 % kusov testovaných“.

Potom v `produkty.js` stačí `stav: 'novy'` a štítok bude zelený.

**Právne:** pri novom tovare platia iné pravidlá pre záruku a pre informačné
povinnosti. Neprepisuj len marketing — over si aj obchodné podmienky v e-shope.

---

## 3. Nasadiť vlastnú doménu

Doména je natvrdo na štyroch miestach. Nahraď `https://ld-page-computrax.vercel.app`
novou adresou v:

1. `sitemap.xml` — všetkých šesť `<loc>`
2. `robots.txt` — riadok `Sitemap:`
3. každá `.html` — `<link rel="canonical">` (6 súborov, jeden riadok v každom)
4. každá `.html` — blok `application/ld+json`, políčka `url` a `logo`

Interné odkazy medzi stránkami sú relatívne (`/o-nas`), tie meniť netreba.

---

## 4. Spustiť adresu e-shopu alebo ju zmeniť

Otvor `app.js`, prvý riadok:

```js
var SHOP_URL = 'https://computrax.techsaver.sk';
```

To je jediné miesto. Prepíše sa všetkých osem tlačidiel naraz.

**Pozor na „s“:** `techsaver.sk` (bez „s“) je partnerská platforma.
`techsavers.sk` (so „s“) je iná firma.

---

## 5. Pridať recenzie

Až po prvých reálnych objednávkach. Vymyslené recenzie sa nepoužívajú —
pri drahšom produkte znižujú dôveru a sú klamlivou obchodnou praktikou.

Zbierať: meno alebo iniciály, mesto, zakúpený model, hodnotenie, krátky text.
Nezverejňovať: telefón, e-mail, celé sériové čísla, interné dáta zákazníka.

---

## 6. Zapnúť analytiku alebo Meta Pixel

**Dnes web nepoužíva žiadne cookies ani sledovanie.** Je to jeho právna výhoda —
netreba cookie lištu ani zásady spracovania údajov.

Ak sa to zmení, treba naraz spraviť všetko toto, inak hrozí pokuta:

1. Cookie lišta so **súhlasom vopred** — skripty sa nesmú načítať skôr,
   než návštevník klikne „súhlasím“ (§ 109 ods. 8 zákona 452/2021 Z. z.)
2. Možnosť súhlas kedykoľvek odvolať
3. Zásady ochrany osobných údajov (GDPR, čl. 13)
4. **Zmazať vetu v pätičke** všetkých šiestich stránok: „nezbiera osobné údaje
   a nepoužíva cookies ani analytické nástroje“ — inak by to bola nepravda

UTM parametre na tlačidlách cookies nepoužívajú a fungujú aj teraz.

---

## 7. Zmeniť hlavičku alebo pätičku

Sú zduplikované vo všetkých šiestich `.html` súboroch — cena za web bez build
kroku. Zmenu treba spraviť šesťkrát. Ak sa stránok pribudne viac, oplatí sa
zvážiť generovanie.

---

## 8. Doplniť ďalšiu sociálnu sieť

Instagram a TikTok sú v pätičke a v štruktúrovaných dátach (`sameAs`).
Ďalšiu sieť treba pridať na dve miesta v každom zo šiestich súborov:
zoznam `<ul class="socialne">` a pole `sameAs` v `application/ld+json`.

## 9. Podklady majú viac verzií — pozor na to

Súbor `computrax-podklady.txt` existuje vo viacerých kópiách v Downloads
a na Ploche a **líšia sa obsahom**. Najnovšia je tá na Ploche (13.08.2026),
hoci tá v Downloads je väčšia a pôsobí úplnejšie. Vždy over dátum zmeny.
