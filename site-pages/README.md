# Site pages wave — built 2026-11-09 (Vance's orders ~21:38–21:39 MST)

Seven house pages, Apple Clean layout (same CSS family as the
parallel front-page build: `--ground #f5f5f7`, white cards, `--gold
#b98a1c` restrained accents), all STAGING ONLY. Not deployed to
ailux.ca — they go to Vance's eyes first (SEE-IT-FIRST), per the
standing rule.

| Page | File | Wired to |
|---|---|---|
| Affiliate — Tools We Use & Recommend | `affiliate.html` | The house ledger's scout-verified program terms; PartnerStack = the one door already open (house account live). **No live referral links exist yet** — every slot honestly says "joining the shelf"; per-program signups queue to Finisher-Signups. |
| Referral — Bring a Friend | `referrals.html` | The house doctrine: give-first, Gratitude Ledger, opt-in-only list. Reward shown as **"being set"** — UNSTAMPED, no numbers invented. Interest form is display-only in staging (sends/stores nothing). **Share row added Nov 9 ~21:47 MST (Vance's ask): see the note below the gaps list.** |
| Game — Playground Games Room | `games.html` | The real `playground_credits` config slots (`credits-starter`, `credits-maker`) via `stripe-pay-local.js` (a copy of `config/stripe-pay.js` whose config fetch path is adjusted for this folder's depth — original renderer untouched). Null URLs render the honest "Opens December 1" state. Prices UNSTAMPED, stated on the page. No game claimed playable that isn't built. |
| Program — Programs & Perks | `programs.html` | Status discipline: Deepgram $200 IN HAND · Together up-to-$15K applied/pending · Cloudflare $10K application filed · Runware submitted Nov 9 (up to $1,000, ~4-week reply window) · Stellar $35K application filed · Payoneer in review since Oct 31 · House programs: First Access (live), founding door (terms being set), Gratitude Ledger. |
| Automation — The Workshop | `automation.html` | The four live Fiverr gig lines with their real package prices (from `gig-descriptions-benefits-first-drafts.md`), quote-and-pay flow linked to `../stripe-wiring/quote-and-pay/index.html` (50% down / balance before final release; crypto rail mirrors). PROVE-IT-FIRST badges distinguish the proven desk from desk-scoped offers. No Fiverr URL is used — none exists in the record; the page routes to Aimée's desk instead. |
| Membership — Become Part of the House | `membership.html` | Two real levels only: **House Guest** (free, open now — the Guest Book sign-up; the book itself wires at deployment like the front-page form) and **Founding Membership** (the founding circle forming for Dec 1; price + terms **BEING SET**, UNSTAMPED). Wired to the new `membership.founding-member` config slot (null URL → renders the honest "Opens December 1" state via `stripe-pay-local.js`); verify.sh expectations extended and passing. Members-get list uses only canon: First Access, the private chat room, Cinema series rooms hosted by Aimée, a Guest Book place, first news via the opt-in list (opt-in only, never bought/sold — printed on the page). The briefings readers' circle is mentioned with prices "being set" — no numbers. **One-tap social sign-in row (Vance's addition Nov 9 ~21:55 MST): see the sign-in note below.** |
| Video — The Cinema | `video.html` | Series slate (Forging Heaven, Harbour of Lights, The Storybook + Story Keepers, Ghost Talk Live) and the posted pieces with log-verified facts. Harbour teaser carries its five verified platform URLs + song credit (A Million Times Better — Take 2). Storybook Page 1 names its song (Heaven on Earth) and its channels from the Nov 9 drip log **without URLs** — none are recorded in the daily logs. "Join our adventure" close per doctrine. **The Big Screen added Nov 9 ~21:49 MST (Vance's ask) — see the Big Screen note below.** |

## Named gaps / unstamped marks (nothing invented)

- **Affiliate:** no live referral links anywhere on the page (none exist);
  Systeme.io hold/minimum/clawback and Snov.io hold/minimum not restated in
  the vetting note — page says they are confirmed in writing before the link
  goes live. StoryShort AI (rail unstated) and AutoShort (min/rail unstated)
  flags printed on their cards. Workstatus (3-month hold) + Draw UAE
  (90-day clawback) appear ONLY as flagged caution examples.
- **Referral:** the reward itself is UNSTAMPED — mechanism only.
- **Games:** credit-pack prices UNSTAMPED (config `price_display` carries
  it; page states it in words). No playable games exist yet to link.
- **Programs:** founding-cohort terms are being set — printed as such.
- **Automation:** no Fiverr shop URL in the record → page names the shop
  ("Lux Automation AI on Fiverr") without a link.
- **Video:** Storybook Page 1 platform URLs are not in the house logs →
  channels named, no URLs fabricated. TikTok gap stated on the page.
- **Membership:** the founding price and full terms are UNSTAMPED —
  shown as "being set," no tier names or numbers invented. The House
  Guest level is free and real (Guest Book); the book's form wires to
  the house list endpoint at deployment, same as the front page's.
  The founding cohort's "~50" planning figure is internal — the page
  says "a small founding cohort," not a count.

## Social sign-in — membership.html (added Nov 9 ~21:55 MST, Vance's ask)

The join section carries a one-tap social sign-in row, in each
provider's standard recognisable style, in Vance's order (his checkout
rule: familiar options right in front, Google first):

- **Continue with Google** — white button, four-colour G mark.
- **Continue with Apple** — black button, white Apple mark.
- **Continue with Facebook** — Facebook-blue button, white f mark.

**Staging honesty:** the buttons are present and correctly shaped but
are NOT wired to any provider and never fake a login. A note under the
row says "Sign-in opens with the house on December 1," and tapping any
button updates that note in place: "Preview only: Continue with X
opens with the house on December 1 — nothing was signed in, and
nothing left this page." No external auth endpoint is called.

**Deployment-step job (for the go-live checklist):** real OAuth wiring
for all three providers — Google, Apple, Facebook — against the
house's member store, so a December 1 join creates/loads the member
record (Guest Book place + founding status) from the provider sign-in.

## Share buttons — referrals.html (added Nov 9 ~21:47 MST, Vance's ask)

A "Share the invitation" section sits right under the hero on
`referrals.html`, with five REAL client-side actions — all share the
house address `https://ailux.ca` with a short give-first invitation
line; no personal names in any share text; nothing tracked:

- **Copy link** — copies `https://ailux.ca` to the clipboard
  (`navigator.clipboard`, with a textarea/execCommand fallback) and the
  button shows a "Copied ✓" state for ~2 seconds.
- **Email** — a `mailto:` link with a pre-written subject ("Come see
  what Lux Automations is building") and an invitation body — an
  invitation, not a sales pitch — ending in the house address.
- **Facebook** — `facebook.com/sharer/sharer.php?u=` with the house
  address, opening in a new tab.
- **X** — `twitter.com/intent/tweet` with the invitation line + the
  house address, opening in a new tab.
- **WhatsApp** — `wa.me/?text=` with the invitation line + the house
  address, opening in a new tab.

Behaviour note: all five work from the staging file as-is — the three
platform buttons are plain public share URLs (the platform fills its
own dialog), the mailto hands off to the visitor's mail app, and the
copy button runs locally. No honest-preview exception was needed;
nothing is decorative.

## The Big Screen — video.html (added Nov 9 ~21:49 MST, Vance's ask)

A cinema player at the top of the Cinema page, above the slate: one
large 16:9 screen (full-width, phone-first) with a playlist of big tap
targets under it. Selecting a playlist item loads it into the screen
and updates the title + song line beneath (every item carries its song
credit and, where the song is buyable or next on the ladder, its
find-it line to the jukebox). No autoplay; nothing plays until tapped.

**Fullscreen (Vance's addition, same night):** every embed is a
standard youtube-nocookie iframe with `allowfullscreen` and
`allow="…; fullscreen"`, so YouTube's own fullscreen control is live
on phone and desktop; a page-level "Watch full screen" button also
calls `requestFullscreen()` on the player frame itself. No native
`<video>` element is used today — if one is ever added, it gets the
same requestFullscreen button treatment. No letterboxed fakes.

**Plays in-page (YouTube embeds; every ID verified in the dream-drip
log `goals/facebook-group-launch-ai-art-wild-videos/hidden_files/dream-drip-log.md`
unless noted):**
- Harbour of Lights — The Town Before the Lights — `oEDFYUJKPEo` —
  song: A Million Times Better — Take 2 (log 2026-11-09; also the five
  platform URLs in the Now Showing card).
- The Harbour Answers Back (Christmas Test 5, pier walk) —
  `y_HIc96yLLk` — song: The Light That Came Home (daily log
  2026-11-08, "Test 5 posted everywhere"; landscape YouTube version).
- The Storybook, Page 1 — The High Arctic, Nunavut — `SttF-Gz-V-s` —
  song: Heaven on Earth (log 2026-11-09 posted run; this also gives
  the Now Showing card its missing YouTube URL — the card's other
  platform links were left as named channels, since only the YouTube,
  FB, IG, Threads and X URLs in that log entry were recorded there in
  full; they can be added to the card on a later pass).
- Forging Heaven — The First Flight Over the Changed World —
  `DhBVA7OxBLU` — song: The Light That Came Home — Take 2 (log
  2026-11-08).
- The Harbour at First Snow — `YUHqwDQG0oI` — The Light That Came
  Home — Take 2 (log 2026-11-06).
- The Lantern Ferry at Dusk — `SqLVr2bDrh0` — Heaven on Earth (log
  2026-11-06).
- The Christmas Harbour Bells — `kawaq1u8TAc` — A Million Times
  Better — Take 2 (log 2026-11-07).
- The Tide Bell at Dawn — `oCmbhTOgtug` — The Light That Came Home —
  Take 2 (log 2026-11-07; found already Public on the channel).
- The Winter Harbour Lights — `YOr0HdDrfZA` — Heaven on Earth (log
  2026-11-07/08).
- The First Star Over the Harbour — `I5s9BLQJOTI` — A Million Times
  Better — Take 2 (log 2026-11-08).

**Links out instead of embedding (and why):** Facebook, Instagram,
Threads and X don't offer a true in-page player for these posts, so
nothing fakes one — the Harbour teaser's Now Showing card carries its
five verified platform URLs as honest "Watch on …" links, and the Big
Screen notes the pieces live on all five channels.

**Poster slot (no player, honestly labelled):** Forging Heaven —
Episode 1. The record says Episode 1 v2 "stays posted", but no URL
for it exists anywhere in the house files (searched the Nov 3–9 daily
logs), so it appears as a "Coming to the big screen" playlist item
that swaps the screen to a coming-attraction poster — never a dead
or invented embed.

**Never in the playlist:** the A Million Times Better music video.
Its Nov 7 YouTube posts were taken down on Vance's own order that
day (daily log 2026-11-07); the rebuilt video goes up only on his
stamp, so no ID from that rollout is used anywhere on this page.
