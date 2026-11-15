# Cinema — House Classics Wing · Build Notes (LIVE)

**Workstream G-Deploy — LIVE on Vance's direct order, 2026-11-15 ~01:12 CST**
("set up the page to put it on our site"), confirmed ~01:16 CST with the
batch rule: hang titles AS THEIR CHECKS CLEAR, in small verified batches;
later batches follow as the catalogue correction pass firms up further
titles. Spend: $0. No accounts, no sends, no mail. No film was downloaded;
no film file is hosted by the house — every player embeds from the
Internet Archive.

**Deployment path:** this worktree is the `lux-headquarters` GitHub repo
(`cyrvance53/lux-headquarters`, branch `main`); commit + `git push origin
main` deploys to ailux.ca via Cloudflare Pages. Live verification = the
real ailux.ca URLs fetched and checked after each push.

---

## Layout spec — two rooms, one Cinema (Vance, 2026-11-15 ~01:17)

- **The Cinema MAIN section** (cinema/) is the house's front room: the
  screen that opens on *Lest We Forget*, the series, house originals —
  **and, by Vance's refinement recorded the same night, newer work posted
  by CLIENTS on the UPGRADED membership.** Main-section posting is an
  upgraded-tier privilege (see membership-benefits notes below).
  **Fences:** members screen only what they have the rights to; member
  posts pass the house's rights/shelf check BEFORE they appear (nothing
  goes up unchecked — the same spirit as the tier rule). Member-posting
  machinery is NOT built in this pass; this paragraph is the spec.
- **The CLASSICS wing** (cinema/classics/ — this build) is a **separate
  section altogether**: its own poster wall, filters, and per-movie
  pages. It stays the **curated heritage shelf** (public-domain +
  licensed lanes), **separate from member posting entirely**.
- **Cross-links both ways (Linking Law):** the Cinema front carries a
  Classics-wing linkcard + nav link; every Classics page links back to
  the Cinema front and the house. Aimée's tour walks between the rooms.
  Neither room is a dead end.

## Membership-benefits notes (recorded 2026-11-15 ~01:17, Vance's word)

1. **"Post to the main section" = upgraded membership.** Upgraded-tier
   members may post their own newer work to the Cinema's main section,
   beside the house's originals (rights/shelf check first — see fences
   above).
2. **Upgraded members get MORE CREDITS** — a larger credit allotment
   rides the upgraded membership. **Principle only:** bigger tier = more
   credits; top-ups are bought at the member's own tier rate. **Exact
   credit counts remain UNSTAMPED**, sized by the meter pass — no amounts
   are stated here or anywhere in this build. (Checked 2026-11-15:
   `site-pages/membership.html` states no credit counts.)
   No standalone membership-benefits document exists in the worktree or
   home-base; these notes are recorded here, beside the posting right,
   as directed.

## Tiered clearance — the CORRECTED Canadian test (Vance, 2026-11-15 ~01:14)

This test governs what goes live; where the catalogue file and this test
disagree, this test governs.

- For a **dramatic cinematographic work**, Canada's term runs from the
  **LAST SURVIVING author — director, screenplay/dialogue author, AND
  composer of music created for the work — + 70 years**. A Tier-1 basis
  must be written in that form (all three author classes), never a
  director-date shorthand.
- **Transitional basis:** the 2022 life+70 extension (CUSMA, in force
  Dec 30, 2022) was **not retroactive** — a work whose term had already
  expired under the old life+50 regime stayed public domain. So where
  the last surviving author died **before 1972**, the Canadian term had
  expired by end of 2021 at the latest, before the extension, and was
  not revived. A death in **1972 itself** is the boundary: the extension
  caught those works (life+50 would have run to end of 2022) — they are
  NOT conclusive.
- **Non-dramatic cinematographic works** (documentary/actuality) run
  **70 years from making** (or the earlier of 75 years from first
  publication / 100 from making if published) — cited as such where used.
- **US side:** every live title is pre-1931, so the US term (95 years)
  expired by calendar — date-conclusive in the US.
- Titles whose basis cannot be written in the corrected form stay OFF
  the wall (parked/held) and are reported. A smaller solid wall beats a
  bigger wall on shorthand.

Source catalogue: `~/workspace/home-base/cinema-classics-catalogue-2026-11-15.md`
(Workstream F, as amended — Tier Map: Tier 1 = 23 · Tier 2-clean parked =
33 · Fenced UNVERIFIED = 24). Clean List numbers below are that file's.

---

## BATCH 1 — LIVE (15 titles), by genre, with per-title basis

### Classic Animation
- **Little Nemo (1911)** — Winsor McCay. Clean #49. US: pre-1931 term
  expired. Canada: sole author in all classes — director/screenplay/
  animation McCay (d. 1934); no composer of music created for the work
  (silent short, theatre accompaniment). Last surviving author 1934 →
  life+50 expired 1984, life+70 expired 2004. Print: IA `LittleNemo_548`
  (silent_films/feature_films, 10:34, the 1911 film).
- **Gertie the Dinosaur (1914)** — Winsor McCay. Clean #48. US: pre-1931
  term expired. Canada: McCay (d. 1934) sole author, as above → expired
  on both readings. Print: IA `silent-gertie-the-dinosaur`
  (silent_films/feature_films).

### Comedy
- **The General (1926)** — Keaton & Bruckman. Clean #9. US: pre-1931
  term expired. Canada: directors Keaton (d. 1966), Bruckman (d. 1955);
  screenplay Bruckman / Al Boasberg (d. 1937) / Keaton; no composer of a
  fixed original score forms part of the work (1926 theatre
  accompaniment; later re-scores, e.g. Carl Davis's, are separate
  editions and are not the print used). Last surviving author 1966 →
  life+50 expired end of 2016, before the 2022 extension; not revived.
  Print: IA `TheGeneral_201312` (feature_films archival item).
- **Steamboat Bill, Jr. (1928)** — Reisner, with Keaton. Clean #10. US:
  pre-1931 term expired. Canada: directors Reisner (d. 1962), Keaton
  (d. 1966); screenplay Carl Harbaugh (d. 1960). Last surviving author
  1966 → life+50 expired 2016, pre-extension. Print: IA
  `SteamboatBillJr`.

### Drama
- **Broken Blossoms (1919)** — D. W. Griffith. Clean #1. US: pre-1931
  term expired. Canada: director/screenplay Griffith (d. 1948); source
  stories Thomas Burke (d. 1949); original score Louis F. Gottschalk
  (d. 1935). Last surviving author 1949 → life+70 itself expired 2019.
  Print: IA `BrokenBlossoms`.
- **Sunrise: A Song of Two Humans (1927)** — F. W. Murnau. Clean #4. US:
  pre-1931 term expired. Canada: director Murnau (d. 1931); screenplay
  Carl Mayer (d. 1944); Movietone score Hugo Riesenfeld (d. 1939);
  source novella Hermann Sudermann (d. 1928). Last surviving author
  1944 → expired on both readings. Print: IA `sunrise_1927`
  (feature_films).

### Horror — Classic (pre-1960)
- **The Cabinet of Dr. Caligari (1920)** — Robert Wiene. Clean #2. US:
  pre-1931 term expired. Canada: director Wiene (d. 1938); screenplay
  Hans Janowitz (d. 1954), Carl Mayer (d. 1944); no single commissioned
  score forms part of the 1920 work (premiere accompaniment was theatre
  compilation; modern scores are edition layers). Last surviving author
  1954 → life+70 expired end of 2024. Print: IA
  `DasKabinettdesDoktorCaligariTheCabinetofDrCaligari`.
- **Nosferatu (1922)** — F. W. Murnau. Clean #23. US: pre-1931 term
  expired. Canada: director Murnau (d. 1931); screenplay Henrik Galeen
  (d. 1949); original score Hans Erdmann (d. 1944); source novel Bram
  Stoker (d. 1912). Last surviving author 1949 → expired on both
  readings. Print: IA `nosferatu.-1922` (archival print; modern
  replacement-score editions avoided).
- **The Phantom of the Opera (1925)** — Rupert Julian. Clean #25. US:
  pre-1931 term expired. Canada: director Julian (d. 1943); screenplay
  Elliott J. Clawson (d. 1949), Raymond L. Schrock (d. 1950); source
  novel Gaston Leroux (d. 1927). Last surviving author 1950 → expired
  on both readings. Print: IA `silent-the-phantom-of-the-opera`
  (silent_films/feature_films) — the 1925 silent original, NOT the
  1929/30 sound reissue.

### Romance
- **The Sheik (1921)** — George Melford. Clean #37. US: pre-1931 term
  expired. Canada: director Melford (d. 1961); screenplay Monte M.
  Katterjohn (d. 1949); source novel E. M. Hull (d. 1947). Last
  surviving author 1961 → life+50 expired 2011, pre-extension. Print:
  IA `TheSheik` (feature_films, 86 min).
- **The Son of the Sheik (1926)** — George Fitzmaurice. Clean #38. US:
  pre-1931 term expired. Canada: director Fitzmaurice (d. 1940);
  screenplay Fred de Gresac (d. 1943), George Marion Jr. (d. 1955);
  source novel E. M. Hull (d. 1947). Last surviving author 1955 →
  life+70 expired end of 2025 (and life+50 in 2005). Print: IA
  `the-son-of-the-sheik-1926` (silent_films/feature_films).

### Adventure
- **The Sea Hawk (1924)** — Frank Lloyd. Clean #41. US: pre-1931 term
  expired (Duke Public Domain Day 2020). Canada: director Lloyd
  (d. 1960); screenplay J. G. Hawks (d. 1940); source novel Rafael
  Sabatini (d. 1950). Last surviving author 1960 → life+50 expired
  2010, pre-extension. Print: IA `my-movie_202006`
  (silent_films/feature_films). Billed by year — the 1940 Flynn film of
  the same title is a separate copyrighted work.

### Sci-Fi
- **A Trip to the Moon (1902)** — Georges Méliès. Clean #33. US: term
  long expired. Canada: Méliès (d. 1938), author in all classes; no
  commissioned score (1902). Last surviving author 1938 → expired on
  any reading. Print: IA `ATripToTheMoonGeorgeMelies` — the
  black-and-white original, NOT the 2011 hand-coloured restoration.

### War-Era / Documentary
- **Nanook of the North (1922)** — Robert J. Flaherty. Clean #52. US:
  pre-1931 term expired. Canada, two independent bases: (1)
  non-dramatic documentary — 70 years from making (1922) expired 1992;
  (2) author reading — Flaherty (d. 1951) → life+70 expired 2021.
  Print: IA `nanookOfTheNorth1922` (feature_films, 1:17:57) — not the
  colourised/4K edition, not the scored reissue.
- **Man with a Movie Camera (1929)** — Dziga Vertov. Clean #6. US:
  pre-1931 term expired (Duke Public Domain Day 2025). Canada: director/
  screenplay Vertov (d. 1954); no original score was fixed to the film
  (Vertov left performance notes only; circulating modern scores are
  new compositions — edition layer). Last surviving author 1954 →
  life+70 expired end of 2024. Print: IA `man-with-a-movie-camera_1929`.

**Batch-1 genre spread:** Animation 2 · Comedy 2 · Drama 2 · Horror 3 ·
Romance 2 · Adventure 1 · Sci-Fi 1 · Documentary 2. Rows for Film Noir,
Western, Musicals, and Silent Greats render per the twelve-family
taxonomy (Silent Greats is full — every Batch-1 title is silent-era);
empty rows carry the honest "no titles yet" card.

## HELD — Tier 1 in the catalogue, NOT hung in Batch 1 (basis or print)

- **My Man Godfrey (1936) — CANDIDATE, basis FAILS the corrected test.**
  Not in the catalogue. Director Gregory La Cava (d. 1952), but
  screenplay Morrie Ryskind (d. 1985) and Eric S. Hatch (d. 1973, also
  the source novel) — last surviving author 1985 → a Canadian
  life-based term runs decades out; the US side rests on non-renewal,
  which is Tier 2 class. NOT hung on the director-date reasoning.
- **Safety Last! (1923)** — Clean #7. Directors Newmeyer (d. 1967) /
  Taylor (d. 1958) pass, but the writing credits include Hal Roach
  (d. 1992) — the last-surviving-author basis cannot be written
  conclusively. Held for the basis check.
- **The Passion of Joan of Arc (1928)** — Clean #5. Director Dreyer
  (d. 1968) passes, but screenplay co-author Joseph Delteil
  (d. 1978) puts the last-surviving-author term beyond expiry. Held
  for the basis check.
- **The Hunchback of Notre Dame (1923)** — Clean #24. Director Worsley
  (d. 1944), but screenplay Edward T. Lowe Jr. (d. 1973) — past the
  pre-1972 line. Held for the basis check.
- **The Lost World (1925)** — Clean #34. Screenplay Marion Fairfax
  (d. 1970) passes, but the original score is attributed to Rudolf
  Friml (d. 1972) — the exact boundary year the extension caught.
  Print lengths also vary widely (restoration vs short prints). Held
  for the basis + print check.
- **King of Jazz (1930)** — Clean #45. US term expired Jan 1, 2026, but
  music created for the film carries songwriters who died well past
  the line (e.g. Milton Ager, d. 1979) — the composer class cannot be
  written conclusively; Archive prints are split-part items. Held for
  the basis + print check.
- **Sherlock Jr. (1924)** — Clean #8. Basis is writable (Keaton
  d. 1966; Bruckman d. 1955), but the Archive items found are Blu-ray
  disc rips (.m2ts) or modern-score/contemporary-sound edits — no clean
  archival print identified. Held for the print search, per the brief.
- **7th Heaven (1927)** — Clean #39. Basis is writable (Borzage
  d. 1962; Glazer d. 1956; Strong d. 1948), but the only Archive item
  found is a French Blu-ray rip of the Movietone version — an edition
  trap. Held for a clean archival print.
- **Captain Blood (1924)** — Clean #42. Basis is writable, but the only
  Archive copy found is the abridged ~30-minute 9.5mm reduction; the
  complete print is a Library of Congress restoration edition. Held
  for the print check (catalogue's own print trap).

## PARKED — Tier 2 (listed on the wall, no player / no page / no share)

Wall parked section: **Battleship Potemkin (1925)** (Clean #3 — Tier 2
in the amended catalogue: US status rests on a restored URAA term;
moved OFF the draft wall in this deployment, per the brief),
**Angel and the Badman (1947)** (#32, non-renewal), **D.O.A. (1950)**
(#21, non-renewal). All other Tier 2-clean titles (33) and the fenced
UNVERIFIED titles (24) remain parked in the catalogue — nothing hung,
nothing paged. **Charade (1963)** stays in the fence (U11): US PD by
defective notice, but Donen (d. 2019) + Mancini score + Stone story —
specifically NOT hung, per the brief.

## What the build carries (unchanged from the G spec)

Poster wall; per-movie pages as full house pages (house frame, Aimée at
the door, rails, share buttons pointing at the ailux.ca film page,
exactly one sales road to the membership page); genre + rating
pull-downs (both rating senses); the Year BUTTON opening the
near-full-screen decade tile panel (no year pull-down); text search;
original aspect ratio pillarboxed, never cropped; players embedded
from the Internet Archive only; Take-a-Tour in Vance's order with
honest "being readied" labels; house silence during playback (tour/
entertainment elements are static content before/after the player,
never overlays).

## Verification — Batch 1 (local, pre-deploy)

Local static server over the worktree; Archive checked by direct API
calls from the machine (silent route — no house text sent to outside
search):
- Wall, all 15 film pages, Cinema front: HTTP 200 locally.
- All 18 Archive items referenced (15 wall + 3 parked records): embed
  endpoints HTTP 200; all 15 wall posters return image/jpeg from the
  Archive thumbnail service; the default film's embed document carries
  real player markers.
- Wall script syntax-checked (node --check); film-page count = 15,
  none for parked slugs; no DRAFT/noindex flags remain in any live
  file; share hrefs carry ailux.ca and none carries archive.org;
  canonical = house URL; exactly one membership road per film page;
  Cinema front links to classics/ and the wall links back.
- Could NOT verify locally: actual in-browser playback rendering (no
  headless browser in this environment) — the embed-document check is
  the strongest available proxy, stated honestly.
- Live verification after deploy is recorded in the G-Deploy report to
  Vance (live URLs fetched and checked), not in this file.
