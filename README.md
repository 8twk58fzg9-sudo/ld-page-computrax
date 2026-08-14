# Computrax — landing page

Statická jednostránková promo stránka pre Computrax (NANOERA s.r.o.).
Bez build kroku — čistý HTML/CSS/JS.

## Súbory

| Súbor | Popis |
|---|---|
| `index.html` | celá stránka |
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

## Čo na stránke zámerne NIE JE

- **Recenzie** — Computrax zatiaľ nemá reálne hodnotenia a vymyslené sa
  nepoužívajú. Sekciu doplniť až po prvých objednávkach.
- **Produkty a ceny** — stránka len informuje a posiela na e-shop. Fotky v sekcii
  „Dva svety" sú kategórie, nie konkrétne kusy na predaj.
- **Telefónne číslo a WhatsApp** — na želanie majiteľa; kontakt je e-mail.
