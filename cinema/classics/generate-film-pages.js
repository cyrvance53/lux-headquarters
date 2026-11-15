#!/usr/bin/env node
/* generate-film-pages.js — Workstream G tooling (LIVE shelf, 2026-11-15).
 *
 * Generates one static page per Tier 1 wall title at film/<slug>/index.html,
 * from the SAME catalogue data that drives the wall (the CLASSICS array in
 * cinema/classics/index.html). Run from this folder:
 *
 *     node generate-film-pages.js
 *
 * TEMPLATE RULE (Vance, 2026-11-15): a film page is NEVER a bare player.
 * Every film page is a FULL HOUSE PAGE — player + poster/story/share, plus
 * the house frame: top bar back to ailux.ca, Aimée at the door, rails to
 * the Classics wall / other collections / house originals / the other
 * rooms, and ONE sales road to the single membership page. The movie is
 * the hook; the page is the house's advertisement; conversion funnels to
 * one page only.
 *
 * At scale, the pattern is: catalogue data (Workstream F's verified list,
 * tier-checked) -> this generator -> one door per film. Tier 2 / parked
 * titles get NO page, by rule. This tool only writes files inside the
 * worktree; deployment is the worktree's git push to origin/main.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const here = __dirname;
const wallHtml = fs.readFileSync(path.join(here, 'index.html'), 'utf8');

function extractArray(name) {
  const start = wallHtml.indexOf('var ' + name + '=[');
  if (start === -1) throw new Error(name + ' array not found in index.html');
  const open = wallHtml.indexOf('[', start);
  let depth = 0, end = -1, inStr = false, quote = '', esc = false;
  for (let i = open; i < wallHtml.length; i++) {
    const ch = wallHtml[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === quote) inStr = false;
    } else if (ch === "'" || ch === '"') { inStr = true; quote = ch; }
    else if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error('could not parse ' + name);
  return eval('(' + wallHtml.slice(open, end + 1) + ')'); // draft-local data only
}

const CLASSICS = extractArray('CLASSICS');
const FAMILIES = extractArray('FAMILIES');
const CONTENT_LABEL = { family: 'Family-safe', general: 'General', mature: 'Mature themes' };
const SITE = 'https://ailux.ca';
const familyLabel = id => (FAMILIES.find(f => f.id === id) || {}).label || id;
const filmUrl = t => SITE + '/cinema/classics/film/' + t.slug + '/';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
/* Relative roads from film/<slug>/ back into the house. */
const R = {
  home: '../../../../',
  workshop: '../../../../workshop/',
  playground: '../../../../playground/',
  school: '../../../../school-in-a-box/',
  store: '../../../../stripe-wiring/music-store/jukebox.html',
  loyalty: '../../../../loyalty/',
  membership: '../../../../site-pages/membership.html',
  cinema: '../../../',
  wall: '../../'
};

function shareRow(t) {
  const u = encodeURIComponent(filmUrl(t));
  const txt = encodeURIComponent(t.title + ' (' + t.year + ') — watch it in the Lux Cinema Classics');
  return '<div class="sharerow"><span class="shlabel">Share this film</span>'
    + '<button type="button" class="shbtn" id="copylink" data-copy="' + filmUrl(t) + '">Copy link</button>'
    + '<a class="shbtn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '">Facebook</a>'
    + '<a class="shbtn" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=' + u + '&text=' + txt + '">X</a>'
    + '<a class="shbtn" target="_blank" rel="noopener" href="https://wa.me/?text=' + txt + '%20' + u + '">WhatsApp</a>'
    + '<a class="shbtn" target="_blank" rel="noopener" href="https://www.facebook.com/dialog/send?link=' + u + '&redirect_uri=' + u + '">Messenger</a>'
    + '<a class="shbtn" target="_blank" rel="noopener" href="https://t.me/share/url?url=' + u + '&text=' + txt + '">Telegram</a>'
    + '<a class="shbtn" href="mailto:?subject=' + txt + '&body=' + u + '">Email</a></div>'
    + '<script>document.getElementById("copylink").addEventListener("click",function(){var b=this,l=b.getAttribute("data-copy");function d(){b.textContent="Copied \\u2713";setTimeout(function(){b.textContent="Copy link";},2000);}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(l).then(d,function(){window.prompt("Copy this link:",l);});}else{window.prompt("Copy this link:",l);}});</script>';
}

const CSS = `
  :root{--black:#000;--panel-2:#101017;--line:rgba(255,255,255,.14);--ice:#eaf2ff;--gold:#f5c65c;--gold-deep:#d8ab3a;--ink:#f6f3ec;--muted:#a9a5b5;--muted-2:#cfcbd9;--serif:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif;--sans:-apple-system,system-ui,"Segoe UI",Helvetica,Arial,sans-serif;--radius-section:26px;--radius-card:14px;--radius-pill:999px;--aura-soft:0 0 0 1px rgba(255,244,214,.4),0 0 12px rgba(234,242,255,.28),0 0 30px rgba(245,198,92,.20)}
  *{box-sizing:border-box}html,body{overflow-x:clip}
  body{font-family:var(--sans);margin:0;color:var(--ink);font-size:17px;line-height:1.5;-webkit-font-smoothing:antialiased;background:radial-gradient(120% 46% at 50% -6%,rgba(255,255,255,.10),rgba(255,255,255,0) 55%),radial-gradient(900px 480px at 50% 0%,rgba(245,198,92,.08),rgba(245,198,92,0) 62%),linear-gradient(180deg,#0a0a0e 0%,#000 34%,#000 100%);background-color:var(--black);background-attachment:fixed}
  a{color:var(--gold)}img{display:block;max-width:100%}:focus-visible{outline:2px solid var(--ice);outline-offset:3px;border-radius:6px}
  .topbar{position:sticky;top:0;z-index:10;background:rgba(0,0,0,.88);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);padding:13px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .topbar.bottom{position:static;margin-top:8px;border-bottom:0;border-top:1px solid var(--line)}
  .brand{font-family:var(--serif);font-weight:700;font-size:21px;color:var(--ink);text-decoration:none;line-height:1.1}
  .brand small{display:block;font-family:var(--sans);font-weight:600;font-size:11.5px;color:var(--muted);letter-spacing:.22em;text-transform:uppercase;margin-top:2px}
  nav.mainnav{margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;align-items:center}
  nav.mainnav a{color:var(--muted-2);text-decoration:none;font-size:14.5px;font-weight:600;padding:9px 13px;border-radius:var(--radius-pill)}
  nav.mainnav a:hover{background:rgba(255,255,255,.08);color:var(--ink)}
  nav.mainnav a.goldlink{color:var(--gold);font-weight:700}
  main{display:grid;grid-template-columns:1fr;gap:16px;padding:16px;max-width:1080px;margin:0 auto}
  section{background:linear-gradient(165deg,var(--panel-2),#050507 72%);border-radius:var(--radius-section);padding:24px;box-shadow:var(--aura-soft)}
  .eyebrow{font-size:12.5px;margin:0 0 10px;color:var(--gold);font-weight:800;text-transform:uppercase;letter-spacing:.22em}
  h1{font-family:var(--serif);font-size:clamp(30px,6.4vw,44px);font-weight:700;line-height:1.12;margin:0 0 10px}
  h2{font-family:var(--serif);font-size:clamp(22px,5vw,28px);font-weight:700;margin:0 0 10px}
  p{margin:0 0 12px}.lede{font-size:19px;line-height:1.55;color:var(--muted-2)}.secondary{color:var(--muted)}small{color:var(--muted);font-size:13.5px;line-height:1.5;display:block}
  .draftflag{border:1.5px dashed rgba(245,198,92,.55);border-radius:var(--radius-card);background:rgba(245,198,92,.06);padding:12px 16px;font-weight:600;font-size:15.5px;color:#e9dfc4;text-align:center}
  .hostline{display:flex;gap:12px;align-items:flex-start;background:#000;border-radius:var(--radius-card);box-shadow:var(--aura-soft);padding:14px 16px}
  .hostline .hi{flex:0 0 auto;width:38px;height:38px;border-radius:50%;background:#000;box-shadow:var(--aura-soft);display:flex;align-items:center;justify-content:center;font-size:19px}
  .hostline p{margin:0;font-size:15.5px;line-height:1.5;color:var(--muted-2)}.hostline p strong{color:var(--ink)}
  .stage{position:relative;width:100%;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:16/9;max-height:84vh;margin:0 auto;box-shadow:var(--aura-soft);display:flex;justify-content:center}
  .pillar{height:100%;margin:0 auto;max-width:100%;background:#000}.pillar iframe{width:100%;height:100%;border:0;display:block;background:#000}
  .headrow{display:flex;gap:20px;flex-wrap:wrap}.headrow img{width:150px;border-radius:10px;border:1.5px solid rgba(255,255,255,.16);aspect-ratio:2/3;object-fit:cover;background:#0b0b0e}
  .gtag{display:inline-block;margin-top:6px;padding:3px 10px;border-radius:var(--radius-pill);font-size:12px;font-weight:700;background:rgba(216,171,58,.14);color:#ecd28a;border:1px solid rgba(216,171,58,.45)}
  .picktag{display:inline-block;margin-top:6px;margin-left:6px;padding:3px 10px;border-radius:var(--radius-pill);font-size:12px;font-weight:700;background:rgba(234,242,255,.12);color:var(--ice);border:1px solid rgba(234,242,255,.4)}
  .sharerow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}.sharerow .shlabel{font-size:13px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  .shbtn{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:7px 13px;border-radius:var(--radius-pill);border:1.5px solid rgba(255,255,255,.22);background:#000;color:var(--ink);font:inherit;font-size:13.5px;font-weight:700;text-decoration:none;cursor:pointer}.shbtn:hover{background:rgba(245,198,92,.14);border-color:var(--gold);color:var(--gold)}
  .roads{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px;margin-top:10px}.roadcard{text-decoration:none;color:var(--ink);font-weight:700;font-size:14.5px}.roadcard img{width:100%;border-radius:10px;border:1.5px solid rgba(255,255,255,.16);aspect-ratio:2/3;object-fit:cover;margin-bottom:7px;background:#0b0b0e}.roadcard:hover img{border-color:var(--gold)}
  .rails{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:12px}
  .railcard{display:block;text-decoration:none;border:1.5px solid rgba(255,255,255,.16);border-radius:var(--radius-card);padding:18px 16px;background:#000;color:var(--ink)}
  .railcard:hover{border-color:rgba(245,198,92,.8)}
  .railcard .rt{font-weight:700;font-size:16.5px;display:block;color:#fdf8ea}
  .railcard .rs{font-size:14px;color:var(--muted);display:block;margin-top:4px;line-height:1.45}
  .joinroad{display:block;text-decoration:none;text-align:center;border:3px solid var(--gold);border-radius:var(--radius-card);background:linear-gradient(160deg,#2a1f06,#171106 70%);box-shadow:inset 0 0 0 4px #0d0a04,inset 0 0 0 6.5px rgba(245,198,92,.4),0 0 26px rgba(245,198,92,.22);padding:26px 24px 22px;color:var(--ink)}
  .joinroad h2{font-size:clamp(23px,5.4vw,32px);letter-spacing:.1em;color:var(--gold);margin:0 0 10px}
  .joinroad p{max-width:580px;margin:0 auto 10px;font-size:16.5px;line-height:1.55;color:#e9dfc4}
  .joinroad .tapline{display:block;margin-top:10px;font-size:13px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--gold)}
  .roadlinks{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
  .btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:11px 20px;border-radius:var(--radius-pill);font-size:15.5px;font-weight:800;text-decoration:none;background:#000;color:var(--ink);box-shadow:var(--aura-soft)}
  footer{max-width:1080px;margin:0 auto;padding:8px 24px 36px;text-align:center;color:var(--muted);font-size:14.5px;line-height:1.6}
  footer .doorlinks{display:flex;gap:2px;justify-content:center;flex-wrap:wrap;margin:8px 0 6px}
  footer .doorlinks a{color:var(--muted-2);text-decoration:none;font-weight:600;font-size:14.5px;padding:6px 11px;border-radius:999px}
  footer .doorlinks a:hover{background:rgba(255,255,255,.08);color:var(--ink)}
  @media (max-width:560px){main{padding:12px;gap:12px}section{padding:20px 18px}.topbar{padding:10px 14px}nav.mainnav a{padding:7px 9px;font-size:14px}}
`;

function topbar() {
  return '<header class="topbar"><a class="brand" href="' + R.home + '">Lux<small>ailux.ca</small></a>'
    + '<nav class="mainnav" aria-label="The house">'
    + '<a href="' + R.home + '">Home</a>'
    + '<a href="' + R.workshop + '">Business AI Workshop</a>'
    + '<a href="' + R.playground + '">AI Playground</a>'
    + '<a href="' + R.cinema + '">Free Cinema</a>'
    + '<a href="' + R.store + '">Store</a>'
    + '<a class="goldlink" href="' + R.loyalty + '">Loyalty</a>'
    + '</nav></header>';
}

function page(t) {
  const more = CLASSICS.filter(x => x.slug !== t.slug && (x.family === t.family || (t.silent && x.silent))).slice(0, 4);
  const moreHtml = more.length
    ? '<div class="roads">' + more.map(x =>
        '<a class="roadcard" href="../' + x.slug + '/"><img src="https://archive.org/services/img/' + x.ia + '" alt="Poster — ' + esc(x.title) + '" loading="lazy"><span>' + esc(x.title) + ' (' + x.year + ')</span></a>').join('') + '</div>'
    : '<p class="secondary">More titles join this row as the shelf grows.</p>';
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<!-- Generated by generate-film-pages.js from the Classics catalogue data. A FULL HOUSE PAGE by rule: never a bare player. LIVE on Vance\u2019s word, 2026-11-15. -->\n'
    + '<title>' + esc(t.title) + ' (' + t.year + ') — Classics · Lux Cinema</title>\n'
    + '<meta name="description" content="' + esc(t.note) + ' Watch it in the Lux Cinema Classics — playing from the Internet Archive.">\n'
    + '<link rel="canonical" href="' + filmUrl(t) + '">\n'
    + '<meta property="og:type" content="video.movie">\n'
    + '<meta property="og:title" content="' + esc(t.title) + ' (' + t.year + ') — Lux Cinema Classics">\n'
    + '<meta property="og:description" content="' + esc(t.note) + '">\n'
    + '<meta property="og:url" content="' + filmUrl(t) + '">\n'
    + '<meta property="og:image" content="https://archive.org/services/img/' + t.ia + '">\n'
    + '<style>' + CSS + '</style>\n</head>\n<body>\n'
    + topbar() + '\n'
    + '<main>\n'
    /* Aimée at the door — she offers the tour on arrival (conversational
       behaviour itself is taught to her pack separately; this is the
       page-side road). She offers again after the film via the tour
       section below the player — never interrupting a playing movie. */
    + '  <div class="hostline"><div class="hi" aria-hidden="true">👋</div><p><strong>Aimée, your host:</strong> Welcome in — you\u2019ve found one of our Classics. The film is below, the whole house is around it: more classics on the wall, our own films in the Cinema, and the Workshop, Playground and School through the doors at the bottom. Stay as long as you like — the Cinema is always free. <strong>New here? Take the tour below</strong> — I\u2019ll show you what you can make yourself, then the watching, in that order.</p></div>\n'
    /* Film head: poster + story + ratings */
    + '  <section>\n    <p class="eyebrow">House Classics · ' + esc(familyLabel(t.family)) + '</p>\n'
    + '    <div class="headrow">\n'
    + '      <img src="https://archive.org/services/img/' + t.ia + '" alt="Poster — ' + esc(t.title) + ' (' + t.year + ')">\n'
    + '      <div style="flex:1 1 300px">\n'
    + '        <h1>' + esc(t.title) + ' (' + t.year + ')</h1>\n'
    + '        <p class="lede">' + esc(t.note) + '</p>\n'
    + '        <p class="secondary" style="margin:0">Directed by ' + esc(t.director) + ' · ' + esc(t.genre) + '<br>Content rating: ' + CONTENT_LABEL[t.content] + ' · Original aspect ' + t.ratioLabel + (t.aimee ? '<br>House mark: Aimée\u2019s pick ✦' : '') + '</p>\n'
    + '        <span><span class="gtag">' + esc(t.genre) + ' · ' + CONTENT_LABEL[t.content] + '</span>' + (t.aimee ? '<span class="picktag">Aimée\u2019s pick ✦</span>' : '') + '</span>\n'
    + '      </div>\n    </div>\n'
    + '  </section>\n'
    /* The player */
    + '  <section>\n    <p class="eyebrow">Watch</p>\n'
    + '    <div class="stage"><div class="pillar" style="aspect-ratio:' + t.ratio + '"><iframe title="' + esc(t.title) + ' — plays from the Internet Archive" src="https://archive.org/embed/' + t.ia + '" allow="fullscreen; autoplay" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div>\n'
    + '    <small style="margin-top:12px">Plays from its own shelf at the Internet Archive (item: ' + t.ia + ') — the house hosts no film files. Shown in its original shape, pillarboxed on the big screen: never cropped, never stretched.</small>\n'
    + '    <small style="margin-top:6px">Tier 1 — public domain conclusive by date under US and Canadian law · Source list: Cinema Classics catalogue, Clean List #' + t.clean + ' (Workstream F, 2026-11-15).</small>\n'
    + shareRow(t) + '\n'
    + '  </section>\n'
    /* More like this */
    + '  <section>\n    <p class="eyebrow">Keep walking</p>\n    <h2>More like this</h2>\n'
    + moreHtml + '\n  </section>\n'
    /* Rails — the whole house around the film */
    + '  <section>\n    <p class="eyebrow">Around the house</p>\n    <h2>While you\u2019re here</h2>\n'
    + '    <div class="rails">'
    + '<a class="railcard" href="' + R.wall + '"><span class="rt">The Classics wall</span><span class="rs">Every classic on the shelf — comedy, drama, horror, sci-fi and the silent greats, all free to watch.</span></a>'
    + '<a class="railcard" href="' + R.cinema + '"><span class="rt">House Originals — the Cinema</span><span class="rs">Films made by the house itself, on the Cinema\u2019s own stage — Lest We Forget, The Morning Call, and what\u2019s next.</span></a>'
    + '<a class="railcard" href="' + R.workshop + '"><span class="rt">Business AI Workshop</span><span class="rs">AI tools and automation for real businesses — bring a job, leave with it done.</span></a>'
    + '<a class="railcard" href="' + R.playground + '"><span class="rt">AI Playground — and the Maker</span><span class="rs">Make your own movies, shows and pictures with the same tools the house uses.</span></a>'
    + '<a class="railcard" href="' + R.school + '"><span class="rt">School-in-a-Box</span><span class="rs">A whole school in a box — lessons, a teacher in the room, and certificates that count.</span></a>'
    + '<a class="railcard" href="' + R.store + '"><span class="rt">The Store</span><span class="rs">The house\u2019s songs and treasures — the music store and jukebox.</span></a>'
    + '    </div>\n  </section>\n'
    /* TAKE A TOUR — show, don't tell. Order per Vance: the exciting,
       usable things first (make your own), then the watching, ending at
       the one sales page (the join road below). Creative stops PAIR a
       finished house piece that plays with the tool that made it, and
       the stamped free taste (try everything once) rides along.
       HONESTY FENCE: rooms still Locked — being verified are shown as
       being readied / opening, NEVER as open or usable now. */
    + '  <section>\n    <p class="eyebrow">Take a tour</p>\n    <h2>See what you can do here</h2>\n'
    + '    <p class="secondary" style="margin:0 0 6px">Aimée\u2019s route: first the things you can use yourself, then the watching — and it ends at the one membership door.</p>\n'
    + '    <div class="hostline" style="margin:12px 0"><div class="hi" aria-hidden="true">🎬</div><p><strong>First, watch this — the house made it:</strong> <em>The Morning Call</em>, a feeder dreamed up by the house. What you\u2019re seeing was made with the very tools the tour is about to put in front of you.</p></div>\n'
    + '    <video controls preload="none" playsinline poster="../../../assets/morning-call.jpg" style="width:100%;border-radius:12px;background:#000" src="../../../assets/morning-call.mp4"></video>\n'
    + '    <div class="rails">'
    + '<a class="railcard" href="' + R.playground + '"><span class="rt">1 · The Playground & the Maker</span><span class="rs">Make your own videos, music videos and music — the tools that made the piece above. <strong>Being readied — opens January 1.</strong> When the doors open, the house free taste rides with you: try everything once.</span></a>'
    + '<a class="railcard" href="' + R.workshop + '"><span class="rt">2 · Workshop tools</span><span class="rs">AI tools and automation for real work and real businesses. <strong>Being readied — opens January 1,</strong> with the same free taste when it opens.</span></a>'
    + '<a class="railcard" href="' + R.school + '"><span class="rt">3 · The School</span><span class="rs">School-in-a-Box: learn anything, with a teacher in the room and certificates that count. <strong>Being readied.</strong></span></a>'
    + '<a class="railcard" href="' + R.wall + '"><span class="rt">4 · Your own collections & the NFT Box</span><span class="rs">Members keep their own collections on their own Cinema shelf, and what they make is certified theirs in the NFT Box. <strong>Coming with membership — being readied.</strong></span></a>'
    + '<a class="railcard" href="' + R.cinema + '"><span class="rt">5 · House Originals</span><span class="rs">Then the watching: films the house made itself, on the Cinema\u2019s own stage. <strong>Open now — always free.</strong></span></a>'
    + '<a class="railcard" href="' + R.wall + '"><span class="rt">6 · The Classics</span><span class="rs">And the shelf you\u2019re standing at — the classics, free for everyone. <strong>Open now.</strong> The tour ends at the membership door, just below.</span></a>'
    + '    </div>\n  </section>\n'
    /* ONE sales road — the single membership page, nowhere else */
    + '  <a class="joinroad" href="' + R.membership + '">'
    + '<h2>JOIN THE HOUSE</h2>'
    + '<p>One membership opens every door — the Playground, the Workshop, the Maker, member collections in this Cinema, and loyalty that thanks you for staying. The Cinema\u2019s classics stay free for everyone, always.</p>'
    + '<span class="tapline">See membership →</span></a>\n'
    + '  <div class="roadlinks">\n'
    + '      <a class="btn" href="' + R.wall + '">← The Classics wall</a>\n'
    + '      <a class="btn" href="' + R.cinema + '">The Cinema front</a>\n'
    + '      <a class="btn" href="' + R.home + '">Lux — ailux.ca</a>\n'
    + '    </div>\n</main>\n'
    + '<header class="topbar bottom"><a class="brand" href="' + R.home + '">Lux<small>ailux.ca</small></a>'
    + '<nav class="mainnav" aria-label="The house"><a href="' + R.home + '">Home</a><a href="' + R.workshop + '">Business AI Workshop</a><a href="' + R.playground + '">AI Playground</a><a href="' + R.cinema + '">Free Cinema</a><a href="' + R.store + '">Store</a><a class="goldlink" href="' + R.loyalty + '">Loyalty</a></nav></header>\n'
    + '<footer>Lux Automations · A Million Times Better<br>'
    + '<nav class="doorlinks" aria-label="The doors"><a href="' + R.workshop + '">Business AI Workshop</a><a href="' + R.playground + '">AI Playground</a><a href="' + R.cinema + '">Free Cinema</a><a href="' + R.store + '">Store</a></nav>'
    + 'ailux.ca — Edmonton, Alberta · working worldwide, remotely<br>© 2026 Lux Automations</footer>\n'
    + '</body>\n</html>\n';
}

let made = 0;
for (const t of CLASSICS) {
  if (t.tier !== 1) { console.log('SKIP (not Tier 1):', t.slug); continue; }
  const dir = path.join(here, 'film', t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(t));
  console.log('WROTE film/' + t.slug + '/index.html');
  made++;
}
console.log('Done — ' + made + ' full-house film pages generated from ' + CLASSICS.length + ' wall titles.');
