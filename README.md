# GTA6 CZ Map

Česká interaktivní komunitní mapa Grand Theft Auto VI.

## Místní spuštění

```sh
npm ci
npm run dev
```

Mapu otevři na [localhost:3000](http://localhost:3000).

## Mapové podklady

Aplikace používá sadu `yanis,18` z GTADB. Ve složce `public/maps/tiles/6/yanis,18/` mají být adresáře `0` až `5` s JPEG dlaždicemi o rozměrech 256 × 256 px. Příklad cesty je `public/maps/tiles/6/yanis,18/0/0,0,0.jpg`.

Git místní dlaždice ignoruje. Pokud dlaždice v uvedené cestě chybí, Next.js ji načte z [hostingu GTADB](https://map.gtadb.org/). Produkční mapa tak funguje i při nasazení z GitHubu bez dlaždic v repozitáři a v takovém případě závisí na dostupnosti GTADB.

Podklady Yanis V18 poskytuje gtadb.org pod licencí [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Aplikace při vykreslení zakrývá původní postranní panel. [Kredity autorů](public/maps/yanis-v18-kredity.jpg) jsou dostupné v Nastavení → Kredity.

## Body zájmu a legenda

Mapa používá výběr z [dat GTADB pro GTA VI](https://github.com/rolux/gtadb.org/blob/main/map/data/6/landmarks.json) z 18. listopadu 2026 v souboru `components/map/gtadb-points.json`. Výběr obsahuje 946 míst, která mají název i herní souřadnice. Souřadnice jsou zaokrouhlené na desetiny metru, značky mají české kategorie odvozené ze zdrojových štítků a ručně upravená místa jsou v `components/map/map-points.ts`. Data vytvořili gtadb.org a přispěvatelé pod licencí [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Česká legenda používá výřezy symbolů z původní legendy Yanis V18.

Obecné názvy bodů se překládají podle seznamu `genericPointNames` v `components/map/map-points.ts` při shodě celého názvu. Vlastní jména, názvy podniků a značky zůstávají ve zdrojovém znění. Přeložený bod lze najít i podle původního názvu.

Body bez zařazení jsou dočasně vyřazené z mapy, vyhledávání i přehledu kategorií. Zdrojový soubor je dál obsahuje.

## Hlášení chyb

Pro zobrazení tlačítka **Nahlásit chybu** v detailu bodu nastav veřejnou e-mailovou adresu projektu v proměnné `NEXT_PUBLIC_MAP_REPORT_EMAIL`. Pro místní vývoj ji přidej do `.env.local` a restartuj vývojový server. Na Vercelu ji nastav pro příslušné prostředí před buildem. Tlačítko otevře formulář na `/nahlasit-chybu` s názvem a ID bodu, odkazem na produkční mapu a herními souřadnicemi.

Formulář doručuje zprávy přes [FormSubmit](https://formsubmit.co/). Po prvním odeslání z produkční mapy potvrď aktivaci od FormSubmit v projektové schránce, aby služba začala zprávy doručovat.

## Písmo a ikony

[Onest](https://github.com/google/fonts/tree/main/ofl/onest) je pod licencí SIL Open Font License 1.1. [Google Material Symbols Rounded](https://developers.google.com/fonts/docs/material_symbols) jsou pod licencí Apache 2.0. Projekt používá místní výběr ikon. Texty licencí jsou ve složce `app/fonts/`.
