# GTA6 CZ Map

Česká interaktivní komunitní mapa Grand Theft Auto VI.

## Místní spuštění

```sh
npm ci
npm run dev
```

Mapu otevři na [localhost:3000](http://localhost:3000).

## Mapové podklady

**Nastavení → Mapový podklad** nabízí výchozí **Neoficiální mapu** (Yanis V18) a **Oficiální mapu** (plakát Leonidy od Rockstar Games). Výběr se ukládá do prohlížeče. Obě vrstvy používají stejnou instanci Leafletu, herní souřadnice i zoom 0–5.

### Neoficiální mapa

Sada `yanis,18` z GTADB používá adresáře `0` až `5` s JPEG dlaždicemi o rozměrech 256 × 256 px ve složce `public/maps/tiles/6/yanis,18/`. Příklad cesty je `public/maps/tiles/6/yanis,18/0/0,0,0.jpg`.

Git místní dlaždice ignoruje. Pokud dlaždice v uvedené cestě chybí, Next.js ji načte z [hostingu GTADB](https://map.gtadb.org/). Produkční mapa tak funguje i při nasazení z GitHubu bez dlaždic v repozitáři a v takovém případě závisí na dostupnosti GTADB.

Podklady Yanis V18 poskytuje gtadb.org pod licencí [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Aplikace při vykreslení zakrývá původní postranní panel. [Kredity autorů](public/maps/yanis-v18-kredity.jpg) jsou dostupné v Nastavení → Kredity.

### Oficiální mapa

Zdrojový plakát má 2805 × 3840 px a je uložený jako `public/maps/leonida/Leonida_Map_Poster.jpg`. Skript vyrobí WebP náhled, společné dlaždice pro menší přiblížení a dlaždice pro vybraná rozlišení do `public/maps/leonida/generated/`. Spusť ho z kořene projektu s Pythonem a Pillow.

```sh
python -m pip install Pillow
python scripts/generate-leonida.py
python scripts/generate-leonida.py --upscale 2 --upscale 3
python scripts/generate-leonida.py --upscale 2 --sharpen
```

Každý běh připraví původní rozlišení a případné varianty uvedené v příkazu. Zvětšení používá Lanczos a volitelná jemná maska neostrosti se použije na zvětšené varianty před rozřezáním na dlaždice. Zdrojový soubor zůstane beze změny. Pokud máš kvalitnější originál, použij ho s `--source cesta/k/souboru.jpg`. Při stejném ořezu a poměru stran se jeho rozměry převezmou automaticky. Při odlišném ořezu uprav zarovnání podle následujícího postupu.

### Ověření pinů a kalibrace

1. V nastavení zapni **Překrýt podklady** a nastav krytí přibližně na 50 %. Piny, filtry i pozice kamery se při přepínání podkladu nebo změně krytí zachovají. Přepínání samostatných podkladů překryv vypne.
2. Porovnej pobřeží, křižovatky a dráhy letišť v několika vzdálených oblastech. Potom zkus konkrétní piny a zkontroluj, zda jejich špička ukazuje na odpovídající místo. Pro srovnání variant 1×, 2× a 3× použij volbu **Rozlišení oficiální mapy** při zoomu 3 nebo vyšším. Při menším přiblížení mohou varianty sdílet stejné dlaždice.
3. Výchozí zarovnání podle severozápadního mysu a jihozápadního letiště je přibližné. Pro zpřesnění si vyber dva vzdálené body viditelné na obou mapách a třetí nezávislý bod pro kontrolu. Na plakátu změř jejich obrazové souřadnice v pixelech od levého horního rohu. Na komunitní mapě odečti herní souřadnice z ukazatele na desktopu a převeď je na pixely při zoomu 0 vzorci `u = 512 + X / 32` a `v = 512 - Y / 32`.
4. Vypočítej jednotné měřítko `s` jako poměr vzdálenosti mezi dvěma body na komunitní mapě a vzdálenosti odpovídajících bodů na plakátu. V [map-basemaps.ts](components/map/map-basemaps.ts) nastav `leonidaAlignment.width` na `s × šířka plakátu`. Pro první referenční bod vypočítej `left = u - s × xPlakátu` a `top = v - s × yPlakátu`. Výška se dopočítá z poměru stran. Úprava platí pro všechna rozlišení a projeví se bez nového generování dlaždic. Pokud se odchylka na třetím bodě liší od odchylek u referencí, jednotné měřítko a posun nemusí pokrýt místní rozdíly mezi mapami.

## Body zájmu a legenda

Veřejná mapa zobrazuje body s doloženou polohou ve hře. Výchozí výběr a odkazy na doklady jsou v [`lib/verified-map-points.ts`](lib/verified-map-points.ts). Další body přidává správce přímo na mapě nebo schválením návrhu s dokladem polohy. Značky na podkladu mají přibližnou polohu.

[`lib/verified-notebook-points.json`](lib/verified-notebook-points.json) obsahuje výběr z [otevřených dat Leonida Notebook](https://leonidanotebook.com/data/map.json) z 22. listopadu 2026. Každý záznam má ověřený záběr a změřenou pozici ve snímcích herní mapy z Xbox Series S. Normalizované polohy jsou převedené do souřadnic české mapy podle pěti společných míst s [GTA6 GPS](https://gta6gps.com/). U dalších 97 shodných míst se převod od souřadnic GTA6 GPS typicky lišil o 13 metrů. Zdroj každého záznamu odkazuje na konkrétní místo v průvodci Leonida Notebook.

[`lib/verified-guide-points.json`](lib/verified-guide-points.json) obsahuje souřadnice z [GTA6 GPS](https://gta6gps.com/) spárované s jednotlivými snímky herní mapy od PowerPyx. Výběr zahrnuje [banky](https://www.powerpyx.com/gta-6-all-bank-jobs-locations-bank-vaults/), [provozovny krátkodobých půjček](https://www.powerpyx.com/gta-6-all-payday-loans-jobs-locations/), [přepadení výloh](https://www.powerpyx.com/gta-6-all-smash-n-grabs-locations/), [gangové úkryty](https://www.powerpyx.com/gta-6-all-illegal-gang-operations-locations/), [minigolf](https://www.powerpyx.com/gta-6-all-golf-course-locations/) a [kaskadérské skoky](https://www.powerpyx.com/gta-6-all-stunt-jump-locations/). Karty loupeží zobrazují doloženou úroveň zabezpečení, rozmezí možné kořisti nebo popis z herní mapy.

Soubor `components/map/gtadb-points.json` obsahuje pracovní seznam z [dat GTADB pro GTA VI](https://github.com/rolux/gtadb.org/blob/70e2361356/map/data/6/landmarks.json). Data vytvořili gtadb.org a přispěvatelé pod licencí [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Souřadnice GTADB jsou zaokrouhlené na desetiny metru. Česká legenda používá výřezy symbolů z původní legendy Yanis V18.

Obecné názvy bodů se překládají podle seznamu `genericPointNames` v `components/map/map-points.ts` při shodě celého názvu. Vlastní jména, názvy podniků a značky zůstávají ve zdrojovém znění. Přeložený bod lze najít i podle původního názvu.

Body bez zařazení jsou dočasně vyřazené z mapy, vyhledávání i přehledu kategorií. Zdrojový soubor je dál obsahuje.

## Hlášení chyb a návrhy míst

Tlačítko **Nahlásit chybu** v detailu bodu otevře formulář na `/nahlasit-chybu` s názvem a ID bodu, odkazem na produkční mapu a herními souřadnicemi. Výchozí adresa pro hlášení a kontakt je `gta6czmap@gmail.com`. Pro jiné prostředí ji lze před buildem změnit proměnnou `NEXT_PUBLIC_MAP_REPORT_EMAIL`.

Formulář doručuje zprávy přes [FormSubmit](https://formsubmit.co/). Po prvním odeslání z produkční mapy potvrď aktivaci od FormSubmit v projektové schránce, aby služba začala zprávy doručovat.

Pravé kliknutí nebo klepnutí na volné místo na mapě otevře nabídku s návrhem nového místa a kopírováním odkazu na souřadnice. Návrhy míst se ukládají do Supabase a zobrazují se pouze správci na `/admin`.

## Správa bodů v Supabase

1. V SQL Editoru spusť migraci [map_moderation.sql](supabase/migrations/20261118000000_map_moderation.sql).
2. V **Authentication → Users** založ účet správce s e-mailem a heslem. Zkopíruj jeho UUID a v SQL Editoru ho přidej mezi správce.

   ```sql
   insert into public.map_admins (user_id)
   values ('UUID_SPRAVCE'::uuid)
   on conflict do nothing;
   ```

3. Nastav `NEXT_PUBLIC_SUPABASE_URL` a `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` v `.env.local`. Pro produkci nastav stejné proměnné na Vercelu před buildem.
4. Přihlas se na `/admin`, otevři mapu a v detailu pinu zvol **Skrýt bod**. Na `/admin` můžeš skrytý bod obnovit.

Tabulka skrytých bodů ukládá jen jejich ID. Databázové zásady umožňují veřejné čtení ID a upravovat tabulku mohou pouze přihlášení správci.

Pro ukládání návrhů míst spusť také [migraci map_suggestions.sql](supabase/migrations/20261118000001_map_suggestions.sql). Veřejný formulář může návrh vložit a uložené návrhy smí číst pouze správce.

Pro schvalování spusť [migraci map_suggestion_reviews.sql](supabase/migrations/20261118000002_map_suggestion_reviews.sql). Na `/admin` otevři **Posoudit návrh**, uprav veřejný název a popis, vyber kategorii a typ, přilož odkaz na doklad a zvol **Potvrdit polohu a přidat na mapu**. Zveřejněný pin má vlastní odkaz a lze jej skrýt nebo obnovit stejně jako body GTADB.

Pro přidávání bodů přímo z mapy spusť [migraci map_admin_points.sql](supabase/migrations/20261119000000_map_admin_points.sql). Po přihlášení správce klikni pravým tlačítkem na vybrané místo a zvol **Přidat bod**. Vyplň název, kategorii, typ a odkaz na doklad polohy, případně popis. Tlačítko **Přidat na mapu** bod zveřejní na vybraných souřadnicích.

Pro úpravy existujících bodů spusť [migraci map_point_edits.sql](supabase/migrations/20261119000002_map_point_edits.sql). Správce pak může z detailu bodu upravit název, popis, kategorii a typ pomocí tlačítka **Upravit bod**.

Pro ukládání kategorie a typu ve veřejných návrzích spusť [migraci map_point_categories.sql](supabase/migrations/20261120000000_map_point_categories.sql) a po ní [migraci map_point_taxonomy.sql](supabase/migrations/20261120000001_map_point_taxonomy.sql). Druhá migrace přeřadí uložené body a návrhy podle jejich typu do nových skupin, například **Vozidla**, **Obchody** a **Vzhled**. Všechny migrace spouštěj v pořadí podle názvu souboru, včetně mezilehlé migrace `map_hairdresser_category.sql`.

Pro ukládání dokladu polohy spusť [migraci map_point_verification.sql](supabase/migrations/20261122000000_map_point_verification.sql). Starší databázový bod lze zveřejnit doplněním `verification_source` po ověření polohy.

## Soukromá mapa V2

V SQL Editoru projektu spusť [migraci map_v2_points.sql](supabase/migrations/20261120000002_map_v2_points.sql). Mapa V2 používá přihlášení z `/admin`. Přístup k ní může mít nejvýše jeden účet ze seznamu `public.map_admins`. Pokud je v seznamu právě jeden správce, migrace mu přístup nastaví automaticky. Při více správcích ho přiřaď svému účtu v SQL Editoru.

```sql
update public.map_admins
set manages_map_v2 = true
where user_id = 'UUID_SPRAVCE'::uuid;
```

Pro ukládání bodů spusť po vytvoření tabulky také [migraci map_v2_optional_source.sql](supabase/migrations/20261120000003_map_v2_optional_source.sql).

Po přihlášení vyber **Otevřít mapu V2**. Pravým kliknutím nebo klepnutím na mapu otevři nabídku a vyber **Přidat bod**. Zadej název, kategorii a typ. Souřadnice můžeš zpřesnit při úpravě bodu. Body V2 se ukládají do `map_v2_points` a kategorie se odvozuje ze sloupce `type` podle stejné taxonomie jako u veřejné mapy.

V2 začíná prázdná. Pro budoucí přechod lze po kontrole dat použít `map_v2_points` jako zdroj veřejné mapy a pak vyřadit staré zdroje.

## Písmo a ikony

[Onest](https://github.com/google/fonts/tree/main/ofl/onest) je pod licencí SIL Open Font License 1.1. [Google Material Symbols Rounded](https://developers.google.com/fonts/docs/material_symbols) jsou pod licencí Apache 2.0. Projekt používá místní výběr ikon. Texty licencí jsou ve složce `app/fonts/`.
