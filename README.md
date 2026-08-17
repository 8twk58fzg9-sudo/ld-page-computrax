# Computrax — landing page

Statický web pre Computrax (NANOERA s.r.o.) — šesť stránok.
Bez build kroku — čistý HTML/CSS/JS.

## Súbory

Web má šesť stránok: `index`, `o-nas`, `pocitace`, `kontrola`, `firmy`, `kontakt`.
Hlavička a pätička sú v každom súbore zduplikované — pri ich zmene treba upraviť
všetkých šesť.

| Súbor | Popis |
|---|---|
| `index.html` | domovská stránka |
| `produkty.js` | **zoznam počítačov** — jediné miesto, kde sa pridáva alebo mení počítač |
| `styles.css` | štýly (farby prevzaté z loga) |
| `app.js` | nastavuje adresu e-shopu na všetky CTA tlačidlá |
| `assets/` | logo, favicon, OG obrázok |
| `vercel.json` | hlavičky a cache pre Vercel |

## Zmena adresy e-shopu

Adresa je na **jednom mieste** — prvý riadok `app.js`:

```js
var SHOP_URL = 'https://computrax.techsaver.sk';
```

Zmenou tejto premennej sa prepíšu všetky tlačidlá „Pozrieť počítače“
(hlavička, hero, CTA pás, pätička).

## Lokálne spustenie

```bash
python3 -m http.server 8899
```

Potom otvor http://localhost:8899

## Keď sa niečo mení

Pozri **`BUDUCNOST.md`** — konkrétny postup pre pridanie nového (nerepasovaného)
počítača, nasadenie vlastnej domény, zapnutie analytiky a ďalšie zmeny.

## Čo na stránke zámerne NIE JE

- **Recenzie** — Computrax zatiaľ nemá reálne hodnotenia a vymyslené sa
  nepoužívajú. Sekciu doplniť až po prvých objednávkach.
- **Produkty a ceny** — stránka len informuje a posiela na e-shop. Fotky v sekcii
  „Dva svety" sú kategórie, nie konkrétne kusy na predaj.
- **Telefónne číslo a WhatsApp** — na želanie majiteľa; kontakt je e-mail.
