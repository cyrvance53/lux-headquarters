# Front Page — Apple Clean (staging)

Built 2026-11-09 on Vance's order: "front page is a must to clean up fast" +
"apple lay out" — this settles the standing style fork for the FRONT PAGE.
Follow-up the same evening: "do not forget about amiee" — Aimée is the front
door of this page, not a garnish.

- `index.html` — the cleaned ailux.ca front page in the Apple Clean layout
  (design language from `../desk-apple-clean/`: #f5f5f7 ground, white cards,
  clean system type, blue accent, restrained gold kept for Aimée and the two
  shop doors — the merch light-look family).
- `assets/` — real house images copied (originals untouched): Aimée's portrait
  and the three series-moment stills + cliff poster + workshop scene from the
  live site's repo assets; the single's cover as a downscaled display thumb
  (the FINAL2 master is never altered and lives in the music store / delivery
  pack).

## Shape of the page (top to bottom)

1. Slim top bar — Lux Automations · ailux.ca; one-tap doors: Cinema, Workshop,
   Music Store (gold), Merch (gold), Guest Book.
2. **Aimée — the front door.** Her picture, her name, her honest introduction
   ("I'm Aimée, the AI host at the front desk"), the live page's own line
   "Welcome in. What are you looking for?", the December 1 opening pill, and
   her two door cards (Cinema / Workshop). Presented exactly as honestly as
   the live page does today: pictured and welcoming — her live conversation
   arrives with the December 1 opening; there is NO fake chat box here.
3. The Music Store door — the AMTB single (cover thumb, US$4.99 bundle price
   from the wired config slot, soundtrack credit in text) → one tap to the
   jukebox page (`../stripe-wiring/music-store/jukebox.html`), which carries
   the real Stripe checkout.
4. The Cinema — Christmas at the Harbour of Lights (incl. "The lights come on
   December 13" and the "Harbour of Lights" soundtrack line) + A Million Times
   Better in its three moments, with the series' soundtrack line and a
   Guest Book call to action.
5. The Workshop — the four crafts, verbatim from the live page.
6. The Merch Shelf door → `../stripe-wiring/merch-store/index.html`
   (one link only — no product tiles here; merch prices/links stay in the
   merch config slots, rendered "Opens December 1" until their links exist).
7. A First Taste of the Future — "The Morning Call" (poster card; no player —
   the live page's video files are 3.8–8.5 MB hero loops, wrong weight for a
   clean front page; embed decision belongs to the deploy pass).
8. The Guest Book — name / email / I'm-here-for (Films · Automation · Both) /
   optional company, with the live page's privacy line. Static staging form
   (action="#") — it wires to the house list endpoint at deployment, same as
   the live page's form.
9. Footer — Lux Automations · Edmonton, Alberta (from the live page).

## What the cleanup cut (removal is half the job)

- The full-bleed autoplaying video heroes (series-feature.mp4 3.8 MB +
  automation-flow.mp4 8.5 MB) and the animated gradient "house of light"
  stage — the weight and the noise. Replaced by stills and white space.
- The duplicated stacked brand lockups ("AILUX.CA", repeated Lux Automations
  wordmarks) — one slim top bar instead.
- The repeated "Join our adventure" CTAs (three on the live page) — one per
  section that earns it (Cinema + Guest Book).
- The "One house. Two doors." closing section — its one good line ("greeted
  the same way: warmly, and by name") is the spirit of Aimée's door cards;
  the section itself was a third restatement of the hero.
- Emoji-heavy dark door tiles from the coming-soon face — replaced by the
  clean door cards inside Aimée's section.

## Links verified

Every local src/href resolves inside staging (checked 2026-11-09): the two
shop doors land on the real staging pages; the buy itself stays on the
jukebox page via its config slot (LIVE-LINK-SET, US$4.99). Anchors:
#cinema, #workshop, #guestbook, #music, #merch all exist on the page.

## Named gaps (not guesses)

- Guest Book submit endpoint: the live form posts to the house backend; in
  staging the form is inert by design. Wiring = deploy step.
- "The Morning Call" playable embed: not carried (see cut list) — a deploy
  decision, not an oversight.
- Nothing else: all copy is carried verbatim or lightly trimmed from the
  live page repo source (`lux-headquarters-repo/index.html`).
