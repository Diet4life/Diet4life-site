# Diet4Life Concept — project notes

React + Vite + TS + Tailwind + shadcn/ui (Radix) + Framer Motion + wouter routing.
Bilingual (RO/EN) via `src/contexts/LanguageContext.tsx`. Branch for ongoing work:
`claude/tool-usage-check-htkbjz`.

## "Pregătește-te pentru consultație" — consultation prep hub (Consultatii.tsx)

`/consultatii` has a lightweight checklist ("Pregătește-te pentru consultație":
Jurnal alimentar, Analize medicale, Medicație și suplimente, Documente medicale)
all on the same page/route — no new pages, no account system. Checklist item
click smooth-scrolls to its `id="..."` section.

**Reworked to a much simpler, informational-only shape** (superseding an
earlier version that briefly had file-upload widgets, a repeatable medication
form, and a GDPR consent form — all removed after the user clarified: *"Site-ul
NU trebuie să primească sau să stocheze: analize medicale; scrisori medicale;
bilete de externare; alte documente medicale"* and, on GDPR specifically,
*"Eliminam. Pacientul este văzut doar online"* — no physical visit exists where
a paper GDPR form could be signed either, so GDPR consent collection was
dropped from this page entirely rather than reworked). Current shape:
- **Jurnal alimentar** — the only step with real state (localStorage:
  `diet4life_journal_patient`, `diet4life_journal_data`), unchanged
  functionally (3 tabs: Info/PDF, online completion, upload+email). Now also
  shows an explicit confidentiality note ("salvate doar pe dispozitivul tău,
  nu sunt transmise automat"), and "Șterge jurnalul de pe acest dispozitiv"
  wording on the reset action. Progress ("X din 7 zile completate") shown in
  the checklist card header.
- **Analize medicale** — informational only: intro text + an `Accordion`
  listing `LAB_CATEGORIES`. **No upload widget** — explicitly removed per
  instruction ("NU crea sistem de upload. NU stoca analizele pe site.").
- **Medicație și suplimente** — a single paragraph telling the patient to
  prepare their own list. **No form, nothing saved** — explicitly removed
  per instruction ("Nu crea formular care să salveze aceste informații pe
  site.").
- **Documente medicale** — informational only, same reasoning as Analize.
  **No upload widget.**
- **"Trimite pregătirea"** (closing section) — generic copy only ("Trimite
  jurnalul și documentele relevante... prin canalul de comunicare stabilit cu
  dieteticianul"), linking to `/contact` for the actual email/phone. **Does
  NOT display `CLINIC_EMAIL`/`CLINIC_WHATSAPP` directly on this page** — that
  was explicitly requested removed ("Nu afișa adresa de email sau numărul de
  WhatsApp în această etapă"). The pre-existing, older journal-specific send
  flows (Info tab's "Cum funcționează" step 4, the Online tab's "Trimite
  jurnalul" mailto button, the Upload tab's dropzone + mailto-with-manual-
  attach flow, all of which display `contact@diet4lifeconcept.ro` directly)
  were left untouched.

  **This was a deliberate choice, re-confirmed by the user, not an oversight.**
  A later, more literal re-read of the spec flagged these 3 spots (plus the
  3-tab structure vs. the spec's suggested 2-CTA-button layout, and the Upload
  tab existing at all — the spec says the printable/paper variant should NOT
  have any upload-to-site step) as inconsistent with a strict reading of
  "don't show email/WhatsApp at this stage" and "no upload for the print
  path." A concrete fix was proposed (drop the Upload tab, fold Info+Online
  into two clearly-labeled CTAs, replace the direct mailto in those 3 spots
  with the same generic "send via your established channel" wording used at
  the bottom of the page). **User's answer: "Rămâne cum am avut noi
  initial" — keep the existing 3-tab structure and the direct email exactly
  as they are.** Don't re-propose this change unless asked.

**Lab test list** (`LAB_CATEGORIES`) is the exact list the user provided,
deliberately excluding serum protein electrophoresis, zinc, and abdominal
ultrasound per their explicit instruction — don't add those back without
asking.

**No GDPR consent form on this page/site.** User decided explicitly: since
every patient is seen online (no in-person visit), GDPR consent is collected
by the dietitian directly during the consultation itself, not through the
website. So this is intentionally out of scope for `Consultatii.tsx` (and for
this codebase generally) — don't add a GDPR form back here unless asked.

## Environment constraint — read this first

This sandbox's network egress is allowlisted and **cannot reach `*.netlify.app`,
CloudFront, or basically anything outside the allowlist** (verified: `curl` to
`diet4life.netlify.app` gets `CONNECT tunnel failed, response 403`; same for
`WebFetch`). There is no workaround. **The live site cannot be viewed directly
from this environment — screenshots from the user are the only way to see it.**
Don't re-attempt fetching it; ask for a screenshot instead.

**This also blocks deploying from here, not just viewing.** Tried the
`mcp__Netlify__netlify-deploy-services-updater` (`deploy-site`) tool to make a
draft/preview deploy (explicitly requested by the user: "doar un preview, fără
să ating main") — it hands back an `npx -y @netlify/mcp@latest --proxy-path
https://netlify-mcp.netlify.app/...` command to run locally. Running it fails
the same way: `CONNECT tunnel failed, response 403` to `netlify-mcp.netlify.app`
— confirmed directly with a plain `curl -v` CONNECT to that host, same error.
Any `*.netlify.app` host is unreachable from this sandbox, deploy proxy included.
**Don't re-attempt any Netlify deploy from this environment — it cannot work.**
If the user wants a preview without touching `main`, she needs to either run
`netlify deploy` (no `--prod`) herself locally, or open a PR from the working
branch on GitHub if Netlify's Deploy Previews are enabled for this site.

## The live-site vs. git-repo mismatch

The Netlify project (`diet4life`, site id `fb46b783-0032-4b51-971b-b255c590f8b8`)
**is linked** to `github.com/Diet4life/Diet4life-site` for continuous deployment.
BUT the currently-live production deploy was pushed manually via `netlify deploy`
CLI (deploy title: "Integrare conținut real, NutriHub, formular programare"),
**not from this git history** — this repo's only commit is "Add files via
upload" and is a simpler/different build. So right now:

- Live site (netlify.app) ≠ what's in this git repo.
- The live site was itself apparently built with an AI site-builder tool (visible
  chrome in screenshots: "Private / Share / Pre-launch tools / Make public" bar).
- **Do not merge the working branch into `main` until the live-only content below
  is rebuilt in git** — merging triggers an auto-deploy from git that would
  overwrite/lose whatever is live-only right now.
- Netlify site visitor access requires SSO team login (`requiresSSOTeamLogin: all`),
  so even a live URL isn't publicly viewable without being logged into the team.

## Live-site content discovered so far (via user screenshots), not yet in git

Homepage (`/`) — live version is a completely different design from the
`Home.tsx` currently in git (which is just a hero + 2 CTA buttons). Live homepage
sections, top to bottom, as far as confirmed:

1. **Hero**: "Nutriția începe cu întrebarea potrivită." + search bar
   ("Caută întrebări, subiecte, mituri...") + "Începe cu una dintre acestea"
   with 3 clickable question cards: "Fructele seara îngrașă?" (clock icon),
   "Sunt toate caloriile la fel?" (minus icon), "De ce mi-e foame" (heart icon).
   Button "Explorează NutriHub". Right side: lifestyle photo (desk, "Diet4Life
   JURNAL pentru obiceiuri mai bune" notebook, nutrition books, oats, blueberries,
   apple, tea).
   **Open question, not yet answered by user**: does this section *replace* the
   current hero (with "Programează o Consultație" / "Descoperă Serviciile" CTAs)
   or sit as an additional section? Ask before building.
2. A trust bar below the hero (partially seen, cut off): "Informații bazate pe
   dovezi · Nutriționist dietetician autorizat · Resurse educaționale revizuite
   periodic".
3. **"Explorează pe subiecte"** — NutriHub topic cards: "Controlul greutății",
   "Nutriție echilibrată", ~~"Nutriție bariatrică"~~ (**exclude** — see bariatric
   policy below). URLs follow pattern `diet4life.netlify.app/nutrihub/<slug>`
   (e.g. `/nutrihub/nutritie-echilibrata`) — NutriHub looks like its own
   sub-section/hub, not just homepage cards.
4. ~~"Cărți și resurse pentru copii"~~ — book icon, "Pe lângă consultații, am
   creat resurse pe care le poți folosi acasă — cărți și ghiduri de nutriție
   gândite special pentru copii și părinți.", button "Vezi produsele →".
   **User explicitly said to exclude this section from the rebuild.**
5. **"Aplică în viața reală"** — 2 cards:
   - "Calculator necesar caloric" (phone mockup image) → "Deschide calculatorul"
     (maps to existing `/calculator`, already has the IMC section we built).
   - "Jurnal alimentar" (desk/journal image) → "Deschide jurnalul" —
     **this is a food-diary feature that does not exist anywhere in this repo.**
     Scope not yet decided (asked user: placeholder card vs. real localStorage
     page vs. defer — user dismissed the question, unresolved, ask again before
     building this specific card's destination).
   - Disclaimer under the cards: "Instrumentele au rol educațional și nu oferă
     diagnostic medical."
6. **Featured/spotlight block** ("ÎN PRIM-PLAN"): "De ce nu toate caloriile sunt
   la fel?" — split-plate image (salmon/broccoli/quinoa ~550kcal vs.
   donut/chips/chocolate ~550kcal), subtitle "500 kcal vs. 500 kcal: două
   farfurii, efecte complet diferite.", body copy, link "Descoperă diferența →".
   This is clearly the answer page/section for the "Sunt toate caloriile la
   fel?" hero question card. **Confirmed: "Descoperă diferența →" currently
   404s live — nothing has been written for that destination yet.** Build the
   card, but the link has no working target for now (skip it or point nowhere
   functional); the actual article gets written later as a separate task.
7. **Final CTA**: "Ai găsit răspunsurile pe care le căutai?" + body copy
   ("Dacă încă ai întrebări sau îți dorești recomandări adaptate istoricului,
   obiectivelor și stilului tău de viață, mi-ar face plăcere să ne cunoaștem
   și să construim împreună un plan potrivit pentru tine.") + button
   "♡ Hai să ne cunoaștem" (→ presumably `/contact`).

**Homepage is now fully mapped end to end** — section 7 is the last one before
the footer, which already matches what's in git (`Layout.tsx`'s footer), no
changes needed there.

`/consultatii` page — **already fully implements the food-journal flow seen
live, no work needed.** Checked by actually opening `Consultatii.tsx` (not just
inferring from screenshots): it has a complete "Cum funcționează" block with
the exact 4 steps from the live screenshot, word-for-word —
1. Descarcă și printează jurnalul PDF
2. Sau completează-l direct online în tab-ul următor
3. Încarcă fișierul completat (PDF, DOCX, JPG, PNG)
4. Trimite-l pe email la contact@diet4lifeconcept.ro
—plus a real jsPDF-generated 7-day/5-meals-per-day journal with a portion
guide, a full online-completion tab (12-field patient form + day-by-day meal
editor), and an upload tab with mailto handoff. Verified working end to end in
a headless browser: tabs switch cleanly, the PDF download actually fires
(`Jurnal_Alimentar_7Zile_Diet4Life.pdf`). This *is* the "Jurnal alimentar"
feature — the homepage card linking to `/consultatii` already points at a
complete, working destination, not a placeholder.

Nav on live site: Acasă · Despre Mine · Servicii · **NutriHub** · Calculator ·
Rețete · Produse · Consultații (+ RO/EN, Contact button). Note **Rețete is still
in the live nav** — expected, since we've only removed it from git so far, not
yet redeployed.

## Food journal (Consultatii.tsx) PDF fixes and upgrades

Three separate rounds of work on the jsPDF-generated 7-day journal:
1. **Diacritics + layout fix** — jsPDF's built-in "helvetica" font silently
   dropped ă/â/î/ș/ț and corrupted `splitTextToSize`'s width math (text
   overflowing its box). Fixed by embedding DejaVu Sans (Regular + Bold) from
   `/public/fonts/`, fetched at generation time (not bundled) via
   `registerFonts()`. Also added a line near the top of the PDF stating the
   3 ways to complete it (print/online/upload+email), and made the
   instructions box height dynamic instead of fixed.
2. **Day pages only filled ~half the sheet** — meal rows were 12mm
   (`minCellHeight`) and the notes box was a fixed 28mm. Rows are now 20mm
   and the notes box stretches dynamically down to a fixed bottom line
   (`dayPageBottom = 273`), so every day page fills the A4 sheet regardless
   of exact row heights.
3. **Hand-based portion guide** — replaced the old flat "food item → approx
   portion" table with a 5-category hand-measure guide (palm=protein,
   fist=vegetables, cupped hand=carbs, thumb=fats, fingertip=calorie-dense
   add-ons), inspired by a Canva reference the user shared. Color-coded dots
   drawn natively in the PDF (jsPDF `circle()`, no external images) and
   mirrored on the `/consultatii` page itself from the same `PORTION_GUIDE`
   data, so both stay in sync.
4. **Per-meal hunger/fullness/reason upgrade** — user shared an 11-page
   Canva reference ("My Food & Wellness Journal") with a much richer
   structure (personal profile page, hunger/fullness scale + "why did you
   eat" per meal, daily symptoms/hydration/stress/sleep, mid-week check-in,
   weekly reflection, Harvard balanced-plate guide). Given the scope, user
   picked the smallest high-value slice: **only** the per-meal
   hunger-before/fullness-after (1–5) and "why did you eat?" (multi-select:
   Foame/Obicei/Plictiseală/Stres/Emoție/Social/Poftă) were added — to both
   the online form (`journal[day][meal].hungerBefore/fullnessAfter/why`,
   real interactive controls) and the printable PDF (same data if filled
   online; a circleable prompt template if left blank for handwriting).
   Journal stayed at 8 pages. **Not done**, deliberately deferred: personal
   profile page, daily symptoms/hydration/stress/sleep section, mid-week
   check-in, weekly reflection, Balanced Plate guide page — revisit if asked
   to go further with the journal.

The reference PDF and hand-icon images the user shared are Canva *template*
exports/screenshots (visible chrome: "Private/Share/Make public" bar, or
editor toolbar overlapping content, "your logo"/"@yourusername"
placeholders) — never usable as-is; either rebuild the idea natively (what
was done for the portion guide) or ask for a clean exported image.

## Homepage rebuild status

**Done** — `Home.tsx` rebuilt to match the live design end to end (all 7 sections
above), replacing the old CTA-only hero (user confirmed: replace, not additive —
question-driven hero attracts more top-of-funnel visitors than a direct-booking
hero). Implementation choices made along the way, not yet re-confirmed with the
user:
- Orange (`text-orange-600` / `bg-orange-600`, Tailwind's built-in palette) used
  as the accent for this page's CTAs/highlights, matching the live screenshots.
  Not tied to the theme's `--accent` token (which is blue, used elsewhere) —
  deliberately scoped to just this page rather than a global token change.
- New card sections (NutriHub topics, "Aplică în viața reală") use lucide icons
  in colored circles instead of photos, to avoid piling on more broken
  `/images/*.png` references on top of the existing unresolved image problem.
- Search bar and the 3 question cards are functional in a limited way: clicking
  a question card fills the search input (no actual search/results yet, no
  backend or content index exists to search against).
- "Explorează NutriHub" button smooth-scrolls to the `#nutrihub` section on the
  same page (not a separate route) — no dedicated NutriHub hub/subpages exist.
- "Calculator necesar caloric" card → real, working `/calculator` link.
- "Jurnal alimentar" card → links to `/consultatii`, which **already has** the
  full PDF/online/upload/email flow built in (verified — see below). Nothing
  to build here.
- **Featured spotlight ("De ce nu toate caloriile sunt la fel?") removed —
  per explicit user instruction, later in the session.** It was static text with
  no link (its destination 404s live too, nothing was ever written for it) —
  user asked to drop the whole block rather than leave a dead-end teaser on the
  homepage. Removed the section and the now-unused `Flame` icon import from
  `Home.tsx`. The small hero "question card" with the same wording ("Sunt toate
  caloriile la fel?", one of 3 clickable chips that fill the search bar) is a
  different element and was **not** touched — she asked to remove "blocul de
  text" (the spotlight's body paragraph), not the hero chip.
- Removed the old `hero.*` translation keys from `LanguageContext.tsx` (no
  longer used); new copy uses inline `language === 'ro' ? ... : ...` like most
  other pages, not the `t()` helper.

## NutriHub — done

`/nutrihub` (hub index) + `/nutrihub/nutritie-echilibrata` + `/nutrihub/controlul-greutatii`
are built and routed in `App.tsx`. Homepage cards (`Home.tsx`) and the "Explorează
NutriHub" button now link there for real (previously: static `<div>`s / scroll-to-section).
Nav (`Layout.tsx`) has a "NutriHub" link between Servicii and Calculator, matching the
live site's nav order.

**Content pipeline that produced these two articles**: user ran the same detailed
editorial-strategy prompt through both Claude and Gemini independently (13-question
critique of structure/length/graphics/SEO for pillar nutrition articles), compared
the two responses herself, added her own medical corrections (WHO's four pillars —
adequacy/balance/moderation/diversity — not "flexibility"; toned down the weight-loss-rate
claim; grounded metabolic adaptation in a systematic review of 33 studies rather than
the Biggest Loser case; moved eating-disorder safety-net to a small discreet block, not
the article body; dropped FAQPage-as-SEO-trick reasoning since Google retired FAQ rich
results in 2026; reworded the plate's source-attribution), and delivered final Romanian
copy for both articles verbatim. That text is what's now live in the two page components
— **do not rewrite or "improve" it** without the user asking; it already went through two
independent AI reviews plus her own editorial pass.

**Architecture**:
- `src/components/nutrihub/ArticleShell.tsx` — shared reader shell (hero, byline, "Pe
  scurt", key-takeaways box, FAQ accordion, related-articles grid, sources accordion)
  plus small exported building blocks (`ArticleH2`, `ArticleP`, `ArticleCallout`,
  `ArticleList`) that each article page composes into its own `<section>`s. Built once,
  meant to be reused for every future NutriHub article — don't duplicate this structure
  per-page.
- `src/components/nutrihub/PlateDiagram.tsx` — the "Farfuria Diet4Life" visual: a CSS
  `conic-gradient` circle (50% legume / 25% proteină / 25% carbohidrați) + legend, colors
  reused from the site's real `--primary` (green) and `--accent` (blue) tokens as literal
  hex (conic-gradient can't reference `hsl(var(--x))` directly). No external image.
- `src/components/nutrihub/WeightFactorsGrid.tsx` — 2×3 icon grid for the six factors
  influencing weight (alimentație/mișcare/somn/comportament/medicație/biologie).
  Deliberately **not** a radial "factors around a center" diagram — flagged during the
  Claude/Gemini comparison as compressing poorly on mobile; the 2×3 grid was the agreed
  fix.
- **Real name confirmed: Camelia Amuza.** Applied both places: `ArticleShell.tsx`'s
  byline now reads "Scris de Camelia Amuza — nutriționist-dietetician autorizat" /
  "Written by Camelia Amuza — licensed dietitian-nutritionist"; `About.tsx`'s h1 and
  portrait `alt` were "Dr. Andreea Ionescu" (a wrong AI-site-builder placeholder) and
  are now "Camelia Amuza". Deliberately **no "Dr." title** — every other reference to
  her on the site (including her own wording) says "nutriționist-dietetician autorizat",
  never "doctor", so "Dr." would be an invented credential; dropped it rather than
  carrying it over from the old placeholder. `About.tsx`'s portrait image itself
  (`/images/portrait.png`) is still missing — see the image list below.
- **The 3 "specialty" tags removed.** `About.tsx` had a generic AI-site-builder
  chip row under the bio — "Managementul Greutății", "Nutriție Sportivă",
  "Sănătate Femeii" — that the user called out as made-up ("prostiile alea"),
  same category of placeholder as the wrong name/portrait. Deleted outright,
  not replaced.
- **Romanian-only for now.** Both article pages check `language`; if not `"ro"`, they
  render a short "this article is only available in Romanian" notice instead of the
  article, rather than machine-translating unreviewed medical content. Fix once real
  English copy exists.
- Related-article links without an `href` in the `related` array render as a
  non-clickable "în curând"/"coming soon" chip — used for all the secondary articles
  listed in "Still open" below that don't exist yet.

## 3 NutriHub secondary articles written — done, but NOT through the usual pipeline

User pointed out the secondary articles were still just "coming soon" chips
("nu ai completat articolele cu proteina fibre etc") and asked to complete them.
Written and shipped: `src/pages/nutrihub/CataProteinaAmNevoie.tsx`
(`/nutrihub/cata-proteina-am-nevoie`), `CateCaloriiAmNevoie.tsx`
(`/nutrihub/cate-calorii-am-nevoie`), `FibreleAlimentare.tsx`
(`/nutrihub/fibrele-alimentare`) — same `ArticleShell` pattern as the two pillar
articles (tldr, key takeaways, FAQ, related, sources accordion).

**Important difference from the 2 pillar articles: these did NOT go through the
Claude+Gemini-comparison+her-medical-review pipeline described above** — there's no
way to invoke Gemini from this session, and she asked for them to be completed
directly rather than revisiting that process first. Content is grounded in the same
reference values already vetted and live elsewhere on this site (EFSA adult protein
0.83 g/kg, ESPEN senior protein 1.0–1.2 g/kg, WHO/EFSA fiber minimum 25 g/day, EFSA
PAL activity factors — all pulled from `src/lib/necesar-energetic/constants.ts` for
consistency with the calculator), not independently sourced. **Treat these 3 as a
first draft pending her medical review**, same caution as anything medical — flag it
to her rather than assuming they're at the same reviewed bar as the 2 pillar articles.

Wired in everywhere the "coming soon" chips referenced them: both pillar articles'
`related` arrays now link for real; `nutrihub/index.tsx`'s hub grid now shows all 5
articles (was 2) as cards with category badges (Nutriție echilibrată / Controlul
greutății / Macronutrienți), 3-column on desktop; `Calculator.tsx`'s "Vreau să aflu
mai multe despre nutrienți" chip row now links the 3 real ones and keeps only "Sunt
toate caloriile la fel?" as a "coming soon" span (still doesn't exist).

## About.tsx and Services.tsx rebuilt from live content — done

After the live/git mismatch caused repeated confusion, the user switched process:
she photographed every live page and pasted the exact text for the pages that still
needed it (About, Services), rather than more back-and-forth guessing. Both pages
are now rebuilt from that verbatim text, with one deliberate edit applied to both:

- **Bariatric content excluded from both, per explicit re-confirmation this
  session.** Live About mentions "pacienți aflați după operație bariatrică" in the
  opening bio line, and live Services has a full "Pacienți bariatrici" section
  naming an external surgeon ("Dr. Dejeu") to collaborate with. Both directly
  contradict the standing site-wide policy (see "Content policy decided this
  session" below) of excluding all bariatric content until a partnership agreement
  exists. Asked the user explicitly (exclude entirely / include without the doctor's
  name / include as-is) — she chose **exclude entirely**. Applied by dropping the
  bariatric clause from the About bio paragraph (kept the surrounding sentence about
  working with obesity, which is not bariatric-surgery-specific) and omitting the
  "Pacienți bariatrici" section from Services outright — not softened, not
  anonymized, not present.
- **Live shows "Camelia Mandiuc" on About; kept as "Camelia Amuza" everywhere.**
  The pasted live text itself says "Camelia Mandiuc" — same wrong-name issue
  identified earlier this session and already resolved (user confirmed "Amuza" is
  correct). Did not carry the live typo/error back into git.
- `About.tsx` now has, in order: hero (portrait + name + bio, bariatric clause
  removed), "Ce am învățat din practică", a 2-column `Studii și formare` /
  `Implicare profesională` card row (Master + Licență both from UMF „Victor Babeș"
  Timișoara, ESPEN + Colegiul Dieteticienilor Timiș + Comisia de creditare EMCD
  memberships), "De ce Diet4Life Concept", "Filozofia mea", and a "Hai să ne
  cunoaștem" CTA button linking to `/contact`. All sections are the user's own
  pasted text (translated to English for the `en` branch of each string), not
  invented — do not add unverified credentials/affiliations to this page without
  her providing the exact text first, same reasoning as the bariatric exclusion.
- `Services.tsx` **fully replaced** the old generic 2-service accordion (Consultație
  personalizată / Program de slăbire — no real pricing, placeholder AI-site-builder
  copy) with the real live pricing: Consultație de nutriție 300 lei, Ghidaj WhatsApp
  pe 7 zile 150 lei (with its 4-step "Cum funcționează" and the "nu înlocuiește o
  consultație completă" caveat), and 3 Pachete cards (Start 450/500 lei·4 săpt.,
  Echilibru 750/850 lei·8 săpt. — marked "Recomandat", Transformare 950/1100
  lei·12 săpt.), each with its real feature list and strikethrough original price.
  CTA links all point to `/contact`, matching the live site exactly (the WhatsApp
  card's CTA literally says "Începe cu jurnalul" but links to `/contact`, not
  `/consultatii` — kept faithful to live rather than "fixed", since this is a
  reconciliation task, not a redesign).
- Verified with `tsc --noEmit` (clean, same pre-existing `ImportMeta.env` error
  only), `npm run build`, and Playwright screenshots of both pages at 1280px
  (scrolled through to trigger `whileInView` — a full-page screenshot taken without
  scrolling shows blank gaps where those sections haven't animated in yet; that's a
  screenshot-timing artifact, not a real rendering bug, confirmed by checking the
  DOM content and re-shooting with scroll).

## "De cât am nevoie?" calculator — done, replaces the old `/calculator`

The old BMI/deficit/goal-based calculator at `/calculator` is **fully replaced**
(not added alongside) by a spec-driven educational energy/nutrient calculator, per
explicit user decision when asked "keep both or replace" — she chose replace, since
the old one did exactly what the new spec forbids (−500 kcal deficit, "slăbește X kg"
goal picker, BMI shown as a medical verdict with red/green categories).

**The spec (pasted in full by the user) is the source of truth for every formula,
constant, and exclusion — do not change any of them without her explicit approval.**
Medical logic lives entirely outside the page component:

- `src/lib/necesar-energetic/constants.ts` — every numeric constant, each with a
  `DO NOT CHANGE WITHOUT MEDICAL REVIEW` comment: `PAL` (1.4/1.6/1.8/2.0),
  `PROTEIN_G_PER_KG_ADULT` (0.83), `PROTEIN_G_PER_KG_SENIOR_MIN/MAX` (1.0–1.2),
  `CARB_PCT_MIN/MAX` (45–60%), `FAT_PCT_MIN/MAX` (20–35%), `FIBER_MIN_G` (25),
  `WATER_MIN_L/MAX_L` (1.5–2.0), `SENIOR_AGE_THRESHOLD` (65), `MIN_AGE` (18).
- `src/lib/necesar-energetic/calculations.ts` — pure functions only: Mifflin–St Jeor
  REE, TEE = REE×PAL, `truncateKcal` (`Math.trunc`, never rounds — the spec is explicit
  that 2137.92 must display as 2137, not 2138/2150/2100), protein (single reper
  18–64y, range ≥65y), carb/fat gram conversion from the displayed (truncated) kcal.
- `src/lib/necesar-energetic/eligibility.ts` — `isEligibleAge` (<18 blocks) and the
  7-item `SAFETY_EXCLUSIONS` safety filter (pregnancy, breastfeeding, bariatric
  surgery, kidney/liver disease, fluid restriction, eating disorder) — selecting any
  one blocks the standard calculation for everyone, including ≥65y, with the exact
  non-alarmist copy from the spec.
- Both have `.test.ts` files next to them (vitest — added as a new devDependency,
  `npm run test`; pinned to v2 because the project is on Vite 5 and vitest 3+
  requires Vite 6/7/8). 27 tests, all passing, including the spec's own worked
  example (`truncateKcal(2137.92) === 2137`, explicitly not 2138).
- `src/pages/Calculator.tsx` — full rewrite: intro → form (personal data + activity
  level with an inline "help me choose" panel, not a modal + safety filter
  checkboxes) → results (Energie/Proteină/Carbohidrați/Grăsimi/Fibre/Apă, in that
  order, no red/green scoring) → practical food examples (no quantities) →
  **reuses `PlateDiagram` from `@/components/nutrihub/PlateDiagram`** for the
  "Farfuria Diet4Life" section instead of building a second copy → real Romanian
  meal examples → links into the 2 existing NutriHub articles + "coming soon" chips
  for the not-yet-written ones → sources accordion → disclaimer.
- Carbs/fat cards show the percentage range as the primary value with a "Vezi și în
  grame" toggle for the gram conversion, per spec ("prezintă intervalul, nu o țintă
  unică").
- Age <18 is blocked via the same message used as the Zod field-validation error
  (shows inline under the age input, not a separate screen) — it's the same text
  the spec gives verbatim, just delivered as a validation message rather than a
  full block, since that's what "the standard calculator must not continue" means
  for a single required field.
- Verified end-to-end with Playwright: age-block path, safety-filter-block path, and
  a real calculation path (hand-checked the arithmetic: F/30/55kg/160cm/moderate →
  REE 1239 → TEE 1982.4 → 1982 kcal, protein 55×0.83=45.65→46g) — all correct.
  Checked mobile (390px) and desktop viewports.
- Home.tsx's "Calculator necesar caloric" card still points at `/calculator` —
  nothing to change there, same route, new content behind it.

## Calculator v2 — BMI, direction, and orientative weight-loss range — done

User sent a second, much more detailed spec (also pasted in full, also **source of
truth for v1 of this expanded logic** — same "do not change without validation"
rule as the original spec) asking to add BMI status, an orientative direction
(maintain/lose/gain-needs-eval), and a direction-aware calorie range to the
calculator that previously only ever showed maintenance kcal. Before touching
code, flagged to her that the *previous* build had deliberately avoided a
BMI-as-verdict display (red/green, "you should lose weight") per her own earlier
instructions — she confirmed this new spec supersedes that, with much more careful
non-alarmist framing than the old pre-rebuild calculator had (no BMI-as-diagnosis,
no fixed deficit, a floor that blocks unsafe low-calorie output entirely).

**New files / changes, split the same way as before (logic has no copy, copy has
no logic):**
- `src/lib/necesar-energetic/constants.ts` — added, each with the same
  `DO NOT CHANGE WITHOUT MEDICAL REVIEW` marker: `BMI_UNDERWEIGHT_MAX` (18.5),
  `BMI_OVERWEIGHT_MIN` (25.0), `BMI_OBESE_I_MIN` (30.0), `BMI_OBESE_II_MIN` (35.0),
  `BMI_OBESE_III_MIN` (40.0), `BMI_REFERENCE_RANGE_MIN/MAX` (18.5/24.9 — the spec's
  literal weight-range formula factors, kept distinct from `BMI_OVERWEIGHT_MIN`
  even though 24.9 and 25.0 are adjacent, because the spec gives them as two
  different numbers for two different formulas), `WL_DEFICIT_LOW_FACTOR/HIGH_FACTOR`
  (0.80/0.90 — a 10–20% deficit), `WL_FLOOR_KCAL` (1200).
- `src/lib/necesar-energetic/bmi.ts` — new file, pure functions only:
  `calculateBmiRaw` (weight/height_m², unrounded), `formatBmi` (1 decimal,
  **standard rounding**, not truncated — 27.36→27.4, explicitly the opposite
  rounding rule from kcal display), `getBmiCategory` (6 WHO categories, classified
  on the raw BMI), `getDirectionBranch` (collapses the 6 categories into the 4
  status/direction message branches the spec defines — obese grades I/II/III all
  share one status card message, even though the BMI badge itself still shows
  the specific grade), `calculateWeightReferenceRange` (18.5–24.9 × height_m²,
  1-decimal rounding — **never call this "greutate ideală"**, spec is explicit),
  `calculateWeightLossRange` (TEE×0.80–TEE×0.90, `Math.trunc`, computed from
  **actual** weight, never a reference/target weight — and returns `{blocked:
  true}` with no numbers at all, not even the upper bound, when the raw low end
  is `<= 1200`).
- `src/lib/necesar-energetic/calculations.ts` — `calculateCarbsGrams` and
  `calculateFatGrams` signatures changed from a single `energyKcal` to
  `(kcalLow, kcalHigh)`, because the spec requires macro grams to be computed from
  whichever kcal figure is actually shown to the user (maintenance kcal for
  "reference" BMI, the weight-loss deficit range for BMI ≥25) — maintenance callers
  now just pass the same value twice. Updated both call sites and both test files.
- `src/pages/Calculator.tsx` — results section restructured to insert, ahead of
  the existing "Reperele tale zilnice" cards: an IMC card (value + one of the 6
  category badges + the "not a full diagnosis" disclaimer), a status+direction
  card (4 branches, CTA only on the underweight and obese branches per spec —
  **not** on the plain-overweight branch, even though overweight still gets the
  weight-loss energy card with its own CTA below), and a weight-reference-range
  card (always shown, regardless of direction). The energy card itself is now 4
  variants keyed off direction: `maintenance` (unchanged from before), `loss`
  (range + CTA), `loss_blocked` (amber advisory panel, no numbers, CTA — reuses
  the same visual treatment as the existing safety-filter-blocked panel), and
  `underweight_no_calc` (same advisory treatment, no automatic surplus ever
  computed, CTA). Protein/fiber/water stay unconditional (they're weight/age
  reference points, not tied to a direction); carbs/fat still always show their
  %-range, but the "Vezi și în grame" gram-conversion toggle only renders when a
  relevant kcal figure actually exists (i.e. not for `loss_blocked` or
  `underweight_no_calc` — there's nothing to convert).
- `src/lib/necesar-energetic/bmi.test.ts` — new, 12 tests: BMI formula, the
  spec's 27.36→27.4 rounding example, all 6 category boundaries, the 4-branch
  collapse, the weight-reference-range formula, and — the case most likely to be
  gotten wrong — the 1200 floor check using the **raw** low value (a TEE chosen so
  the low end is exactly 1200 still blocks; a TEE chosen so it's 1200.4 does not).
  `calculations.test.ts` updated for the new two-argument carb/fat signature.
  41/41 tests passing across all 3 files.
- Verified end-to-end with Playwright across all 5 branches — reference (maintain,
  no CTA), overweight (loss range + CTA, no status-card CTA), obese (loss range +
  CTA on *both* cards, badge correctly shows the specific grade e.g. "Obezitate
  grad II" while the status text uses the shared obese branch copy), the 1200-floor
  block (hand-picked F/75y/60kg/150cm/low-activity to actually trigger it — TEE
  1402 → low_raw 1121.7 ≤ 1200), and underweight (no auto surplus, protein/carbs
  still shown as general reference points). Checked desktop (1280px) and mobile
  (390px).

## "Clinică" wording removed sitewide — she is 100% online, no physical clinic — done

User pointed out she isn't a clinic at all — every consultation is online, no
physical location. A repo-wide search for "clinic[aă]" found the visible instance
already fixed (Services/About) plus several **live-facing SEO/meta spots that had
never been cleaned up from the original AI-site-builder scaffold** — these were
worth catching now since they were being touched anyway:

- `index.html` — `<title>`, meta description, keywords, OG title/description/image
  alt, Twitter title/description, and the JSON-LD `MedicalBusiness` `description`
  all said "Clinică de nutriție medicală" and, worse, **still advertised "diete
  bariatrice" / "Consultanță Bariatrică"** — directly violating the standing
  bariatric-content-exclusion policy (see "Content policy decided this session"
  above), just in a spot nobody had audited yet since it's not rendered React
  content. All reworded around "Nutriție Online & Consultanță Personalizată" /
  "Consultanță nutrițională 100% online" instead. Left the JSON-LD `@type` as
  `MedicalBusiness` (not a scope-creep schema-architecture decision she didn't
  ask for) — just fixed the description text.
- `LanguageContext.tsx` — `footer.clinic` (used in the footer copyright line)
  renamed to `footer.tagline`, value changed from "Diet4Life Concept - Clinică de
  Nutriție" to "Diet4Life Concept - Consultanță nutrițională online".
- `Contact.tsx` — the hero subtitle said "Programează o consultație **la clinică
  sau online**"; now just "...online." The "Consultații Online" card also implied
  online was an *alternative* to an in-person option ("Ideal dacă ești în altă
  localitate sau preferi confortul de acasă") — reworded to state plainly that
  every consultation is online, since there is no in-person option to compare
  against.
- Confirmed clean otherwise: no address/map on the site, no "cabinet" references
  anywhere in `src/`. The remaining "clinică"/"Clinical Nutrition" hits are
  legitimate academic/institutional terms (About.tsx's "Master, Nutriție
  Clinică" degree name, ESPEN's full English name) — left untouched.

**Follow-up in the same spirit — the "Program" block still implied fixed clinic
hours.** User asked to drop the Luni–Vineri 09:00–18:00 block (scheduling is by
mutual agreement, not office hours) and to have the online-consultation card name
the actual platforms patients can use, not just Zoom/Google Meet — she explicitly
mentioned WhatsApp. Asked me to propose the exact wording before implementing
(gave 2 draft sentences), she approved with one steer: match the site's existing
tone. Applied in `Contact.tsx`:
- "Program" card: icon swapped `Clock` → `Handshake`; text now "Stabilit de comun
  acord" / "Fiind totul online, găsim împreună un interval potrivit pentru tine."
  — no more fixed hours anywhere on the page.
- "Consultații Online" card: text now names all 3 channels ("Toate consultațiile
  se desfășoară online — prin Zoom, Google Meet sau WhatsApp, în funcție de ce ți
  se potrivește mai bine..."), platform badges list is now `['Zoom', 'Google
  Meet', 'WhatsApp']` (was just the first two).
- Verified with `tsc --noEmit` (clean, same pre-existing error only), `npm run
  build`, and Playwright screenshots of `/contact` and the footer.

## Still open / not yet done

- Of the secondary/deep-dive articles referenced from "Citește și" on both NutriHub
  pillar pages, 3 are now written (see the section above): "Câtă proteină am nevoie?",
  "Câte calorii am nevoie, de fapt?", "Fibrele alimentare...". Still missing: "Sunt
  toate caloriile la fel?", "De ce nu slăbesc deși mănânc puțin?", "Ce este platoul
  ponderal?", "Produsele pentru slăbit...". Each of these remaining ones is currently
  a disabled "coming soon" chip in the `related` list, not a broken link.
- A standalone "De ce nu toate caloriile sunt la fel?" article/page still doesn't
  exist anywhere (live or git). It's no longer linked from the homepage (see
  "Homepage rebuild status" — the dead-end spotlight block was removed), but the
  NutriHub "coming soon" chip for it (bullet above) is still there if she wants
  it written later — separate task either way.
- **Hero image — done, see "Site images" below.** No longer broken/missing.
- **"Nutri pentru copii" — done, see the dedicated section below.** She came back
  with the full backstory/spec herself, as promised, so this is no longer open.
- **Products page ("cărțile lui Nutri" / mini-ghiduri / rețete digitale on
  `/products`) — still not scoped or built.** The `/nutri-pentru-copii` page has
  its own self-contained "Explorează lumea lui Nutri" products grid (see below),
  which may or may not end up being the same thing as whatever she eventually
  wants on `/products` — ask before merging the two rather than assuming.

## Content policy decided this session

- **Bariatric nutrition: remove everywhere, including in the rebuild.** No
  partnership agreement yet with the collaborating clinic; must not be public.
  Already scrubbed from git (services, blog, products, education, contact form,
  about page, nutrition page — the whole `/nutrition` page was bariatric-only
  and was deleted). Apply the same exclusion to anything pulled in from the live
  site (e.g. the "Nutriție bariatrică" NutriHub card above).
- **Recipes section: removed from git** (route, nav link, page, translation key).
  Still appears live because that hasn't been redeployed yet — expected, not a bug.
- **Education → "Prevenție & Stil de Viață" subpage: removed** (`EducationPrevention.tsx`
  deleted; route, card in `Education.tsx`'s hub grid, and `prev.*`/`edu.card.prevention.*`
  translation keys all removed). Same reasoning as Recipes and bariatric content: it was
  thin placeholder-card content (5 excerpt-only cards, no real articles behind them,
  nothing reviewed) duplicating ground NutriHub now covers properly (obesity/metabolic
  health overlaps with the "Controlul greutății" pillar article). Decision: fold future
  prevention content into NutriHub via the same Claude+Gemini+medical-review pipeline,
  rather than maintain it as a second, unreviewed education track. Adjusted the
  now-3-category hub copy accordingly ("Trei domenii esențiale...", article-count stat
  35+→26+, and the "Prevenție activă" bullet swapped for "Sfaturi practice"/lightbulb
  icon). At the time, the *hub's own name* stayed "Educație & Prevenție" (`nav.education`,
  `edu.hero.title`, `edu.backhub`) since that was the section's general nav label, distinct
  from the specific subpage that was removed.
- **Blog section removed entirely, and "Prevenție" dropped from the Education hub's
  name too — both per explicit user instruction this session** ("sa scoatem secțiunea
  blog, prevenție"). `Blog.tsx` deleted; `/blog` route, its nav link, and the `nav.blog`
  translation key all removed. Separately, now that the "Prevenție & Stil de Viață"
  subpage no longer exists (see above), the user wants the *hub label itself* to stop
  implying a prevention track: `nav.education`, `edu.hero.title`, and `edu.backhub` are
  now just "Educație" / "Education" (was "Educație & Prevenție" / "Education &
  Prevention"), and `edu.intro.text`'s opening sentence was reworded to drop its
  "Prevenția este mai eficientă..." framing while keeping the rest of the paragraph
  (positioning Diet4Life as a nutrition education authority for adults/parents/children).
  `blog-myths.png` / `blog-med.png` in `public/images/` are now unused — left in place
  (real photos, not placeholders) in case they're reusable for Products/NutriHub later.
- **Education hub removed entirely (supersedes the rename above).** In the very next
  message the user clarified further: "Deci ștergem educație" — not just drop
  "Prevenție" from the name, remove the whole `/education` section. Deleted
  `Education.tsx`, `EducationNutrition.tsx`, `EducationKids.tsx`, `EducationFun.tsx`;
  removed all 4 routes from `App.tsx`, the nav link from `Layout.tsx`, and every
  `edu.*`/`nutredu.*`/`nutredi.*`/`kids.*`/`fun.*` translation key from
  `LanguageContext.tsx` (including `nav.education` itself). No other page linked into
  `/education` except its own subpages' back-links, so nothing else needed touching.
- Two images sent mid-conversation by the user were unrelated personal/medical
  content (hair-loss treatment prescription) — pasted by mistake, explicitly
  disregarded, not part of the project.

## Recent work already done (on the working branch, in git)

- Lenis smooth scroll wired to Framer Motion's frame loop
  (`src/components/SmoothScroll.tsx`), respects `prefers-reduced-motion`.
- `ScrollToTop` component resets scroll via the Lenis instance on route change.
- Subtle `active:scale` tactile feedback added to the shared `Button` component.
- `.gitignore` added (didn't exist before; `node_modules`/`dist` were untracked
  by accident).

## Real logo installed — done

`src/components/Logo.tsx` previously rendered a generic AI-site-builder placeholder
(a circle+checkmark SVG icon next to "Diet4Life / Concept" text) — not a real brand
asset. Replaced with the actual logo: a "D" monogram with a gold cursive "4life"
script through it and "CONCEPT" underneath. The user sent a brand-presentation
image (`78b8d012-image.png`, a moodboard-style mockup on a dark background showing
both color variants plus captions/swatches/font samples — not a clean export), not
an isolated logo file, so the two variants had to be extracted:
- Cropped each variant's logo mark out of its panel (charcoal+gold on ivory =
  "premium"; white on charcoal = "inverted"), excluding the caption text and color
  swatches below each panel and the vignette/blur along the mockup's outer edges
  (confirmed by sampling pixel brightness row-by-row — the vignette reliably stays
  above ~186 brightness even at its darkest, while the real logo strokes/script sit
  well below 180, and it fades out entirely by ~35px in from any edge — the crop
  boxes were chosen to land inside that safe zone).
- Then built actual alpha transparency (not just a flat rectangle): estimated each
  crop's flat background color from its four corners, and set each pixel's alpha by
  its color distance from that background (smooth ramp between two thresholds, not
  a hard cutout), so anti-aliased edges on the thin script strokes fade out cleanly
  instead of leaving a visible box or a light/dark fringe. Verified by compositing
  the result onto white, gray, and the site's actual `--background` (`hsl(0 0% 98%)`)
  — no visible edge in any case.
- Saved as `public/images/logo.png` (premium variant, transparent — this is the one
  actually used, since every current surface on the site is light) and
  `public/images/logo-inverse.png` (white variant, transparent — not wired in
  anywhere yet, saved for if a dark section is ever added).
- `Logo.tsx` is now just an `<img src="/images/logo.png">` at `h-16 w-auto` (was
  sized smaller at first, `h-11`, but "CONCEPT" was barely legible at that size in
  the 80px header — sized up until it read clearly without overflowing the header).
  Both call sites (`Layout.tsx` header and footer) needed no changes beyond that —
  the footer's `grayscale opacity-60` treatment still applies via `cn()` merging
  onto the new `<img>` exactly as it did onto the old icon+text markup.
- Verified with `tsc --noEmit` (clean, same pre-existing `ImportMeta.env` error
  only), `npm run build`, and Playwright screenshots of the header (desktop 1280px
  and mobile 390px) and footer.

## "Nutri pentru copii" — new section — done

User came back with a full, detailed spec for this (source of truth for wording/
structure, same as the calculator specs — implemented essentially verbatim, not
paraphrased) plus the official Nutri character image (an owl mascot with glasses
and a green scarf, next to a plate of colorful produce). Per her instruction the
image is an **official asset — not to be regenerated, redrawn, or cropped**;
saved byte-for-byte as provided.

**New:**
- `public/images/nutri-hero.png` — the provided image, untouched (1672×941,
  ~1.4MB — not compressed either, same "don't modify" reasoning; flag to her if
  load time ever becomes a concern).
- `src/pages/NutriPentruCopii.tsx` — new page at **`/nutri-pentru-copii`**: hero →
  "De ce am creat Nutri" (her personal story, with a "Nu cu.../Ci cu..." visual
  contrast block) → 5 "Ce învață copiii" cards → "Filosofia Nutri" (4 questions +
  central message) → products grid (`NUTRI_PRODUCTS` array — 4 items now, The
  Rainbow Plate / Understanding Nutrients with Nutri ("În curând" badge) / Food
  Play Kit / Visual Meal Planner, add more by extending the array) → "Și pentru
  părinți" → final CTA that scrolls back to the products grid. Copy is bilingual
  (`ro ? ... : ...`) like every other page — spec text was RO-only, so the EN
  side is my translation, not hers.
- `src/hooks/use-document-head.ts` — new, small: sets `document.title` and the
  `<meta name="description">` tag on mount, restores the previous values on
  unmount. The site has no per-page SEO mechanism at all (no react-helmet, no
  SSR) — this is the first one, added specifically because the spec asked for a
  page title/description. It only affects the client-side tab/meta tag, not
  what a non-JS crawler sees (that's still whatever `index.html` has statically)
  — flag this limitation to her if SEO for this specific page matters a lot.
- `Home.tsx` — new section **between "Explorează pe subiecte" (NutriHub) and
  "Aplică în viața reală"**: eyebrow "Pentru cei mici", title "Descoperă lumea
  lui Nutri", 2 paragraphs, highlight pill, CTA button → `/nutri-pentru-copii`,
  small "Cărți • Activități • Jocuri • Resurse pentru părinți" line, and
  `nutri-hero.png` on the right (desktop) / below (mobile) via a standard
  `lg:grid-cols-2` split, same pattern as the page's own hero section.
- `Layout.tsx` / `LanguageContext.tsx` — new nav link "Nutri pentru copii"
  (`nav.nutriKids`), placed right after NutriHub in the nav order (both are
  educational-content sections) and before Calculator/Products/Consultații.
  **NutriHub itself was not touched or renamed**, per her explicit instruction —
  the two are separate destinations.
- `App.tsx` — new route.

**Design notes:**
- Used `bg-amber-50` (Tailwind's built-in warm-cream token, close to the image's
  own ~`#FEF8E1` background) for the Nutri section/page backgrounds, kept
  `text-primary`/`bg-primary` (the site's existing green) for every accent —
  no new colors introduced. Turned out the image's own cream background reads
  as almost the same tone as `amber-50`, so on both the homepage and the full
  page the owl and the plate visually float on the section background rather
  than sitting in an obvious image box — not planned, just a good coincidence
  worth knowing about if the section background color ever changes.
- The provided image already contains both the owl (left) and the plate
  (right) side by side, with a wide empty gap between them — it reads as a
  single wide banner graphic, not a "character on transparent background" cutout.
  Spec called for a 2-column "text left / image right" layout, so that's what's
  built (image scaled to fit the right column, `object-contain`-style, no
  cropping) — but because of how the source image is composed, the owl and the
  plate end up fairly small within that column on desktop. Flagged to her as
  worth a look; if she'd rather it read as one full-width banner instead of a
  half-width column image, or if she can provide the owl and the plate as two
  separate assets, either is a quick follow-up.
- Nothing else was touched — NutriHub copy, the calculator, Services, and every
  other unrelated page/component are untouched, per her explicit "foarte
  important" instruction in the spec.
- Verified with `tsc --noEmit` (clean, same pre-existing error only), `npm run
  build`, `npx vitest run` (41/41 unrelated tests still pass — nothing shared
  was touched), and Playwright screenshots of the homepage section and the full
  page at both 1280px and 390px, plus a direct check that the document title/
  meta description actually change when the page mounts.

**Follow-up round — homepage-only visual polish on the Nutri section.** User sent
a scoped adjustments list (Home only, exact same section position, don't touch
NutriHub/Calculator/Products/Consultatii/footer/other copy/section order — all
respected). Changes, all in `Home.tsx`'s Nutri section only:
- **Image**: grid changed from an even `lg:grid-cols-2` split to
  `lg:grid-cols-[1fr_1.2fr]` (text/image), giving the image column — and so the
  whole `nutri-hero.png`, scaled as one piece — more room without cropping
  anything. **First attempt used a `lg:-mr-6 xl:-mr-10` negative margin to push
  the image further right for extra size, which caused a real 10px horizontal
  overflow on the page (`scrollWidth` 1290 vs `clientWidth` 1280, confirmed via
  a Playwright check) — removed it immediately, verified overflow is gone
  (1280/1280) before screenshotting again.** Because the owl and the plate are
  one merged image (see above — still true, still can't be resized
  independently without cropping or new assets), this grid-ratio change is the
  ceiling of what "make Nutri bigger" can do without violating her "don't crop"
  instruction; said so plainly rather than overclaiming the owl now has more
  visual weight than the plate specifically.
- **Body text**: `text-muted-foreground leading-relaxed space-y-4` →
  `text-base md:text-lg ... leading-relaxed space-y-5` (was relying on the
  browser default size with no explicit class before).
- **"Pentru cei mici" badge**: `bg-primary/10` → `bg-primary/15` plus a
  `border-primary/20` outline, `font-semibold` → `font-bold`, for the requested
  contrast bump.
- **Highlight pill** ("Fără presiune..."): padding `px-4 py-2` → `px-5 py-3`,
  `font-medium` → `font-semibold` — same colors/radius as before (already pale
  primary/10 background, primary-colored text), just more present, not turned
  into a loud banner.
- **CTA button**: added an explicit `focus-visible:ring-2 focus-visible:ring-
  primary/40` (it had none before — hover/active states were already there and
  already matched sibling homepage CTAs); left size/color/copy unchanged, it
  already met the ask.
- **Main hero image placeholder and "Explorează pe subiecte"**: left completely
  untouched. The hero's image container already was `object-cover` +
  `aspect-square` + `rounded-3xl overflow-hidden`, i.e. already exactly what she
  asked for ("prepare it for a future cover image, don't change the layout") —
  confirmed via reading the code, no edit needed. The 2-card NutriHub teaser
  grid (`sm:grid-cols-2 max-w-2xl mx-auto`) already reads as deliberately built
  for 2 cards, not as a broken 3-card grid — confirmed via screenshot, also no
  edit needed.

## Hero section — pixel-perfect responsive refinement — done

User sent a very detailed, breakpoint-by-breakpoint spec (source of truth for
exact px values, same convention as the calculator specs) to refine `Home.tsx`'s
hero section only — search bar, quick-question chips, CTA, and the hero image —
across 5 target viewports: 360×800, 390×844, 412×915, 768, 1440. Explicitly
scoped to the hero `<section>` alone; nothing else on the homepage touched.

**Key structural change**: the hero image used to be `hidden lg:block` —
invisible below 1024px, i.e. on every phone and tablet. The new spec's mobile
section order explicitly lists the image as step 7 (after the CTA, not before),
which means it must render on mobile too, just last — so the `hidden` class
was removed and the image now shows at every breakpoint, sized down via
`max-h-[380px]` (phones) / `md:max-h-[420px]` (tablet) / uncapped at `lg:`
(desktop, where it's a `max-w-[520px]` grid column instead).

**Added a subtitle that didn't exist before** — the spec gave literal text for
it ("Caută răspunsuri clare, bazate pe dovezi, la întrebările tale despre
nutriție și greutate.") since none was there previously; this isn't a rewrite
of existing wording (which the spec explicitly forbade touching), it's new
copy she supplied for a slot that was empty.

**Fluid sizing, not hard breakpoint jumps** — per her "folosește responsive
fluid între ele" instruction, sizing is a mix of one Tailwind arbitrary-value
jump at `lg` (1024px, since the layout itself only has two real states: mobile-
stacked and desktop-grid) plus a `min-[380px]:` variant for the few values that
needed to differ between the 360px and 390–412px clusters specifically (CTA
width, container padding) — not a continuous `clamp()` across the full 360–1440
range, since her own spec gives fixed target numbers per named breakpoint
cluster rather than a single formula.

**Container/grid**: replaced the shared `container mx-auto px-4` (which would
have resolved to 1280px max-width per Tailwind's default breakpoint, not her
requested 1200px) with a hero-local `max-w-[1200px] mx-auto px-[18px]
min-[380px]:px-5 lg:px-8` wrapper — scoped to this section only, doesn't affect
the shared `.container` class used elsewhere on the page. Desktop grid is
`lg:grid-cols-[1fr_0.9fr] lg:gap-[68px]` per spec (was an even `lg:grid-cols-2`).

**Accessibility additions** (none of these existed before): a real `<label
htmlFor="home-search" className="sr-only">` for the search input (previously
placeholder-only); `loading="eager"` + explicit `width`/`height` on the hero
`<img>` to declare its aspect ratio and avoid CLS; `focus-visible:ring-2`
added to the search button, each chip, and the CTA (previously only had
hover/active states, no visible keyboard-focus state). Chips were already
native `<button>` elements and the search input was already inside a real
`<form>`, so Enter-on-search and Enter/Space-on-chips worked correctly
already — verified both explicitly with Playwright (Tab twice from the search
input lands on the first chip; pressing Enter there fills the search field,
same as a click).

**Performance**: added `public/images/hero.webp` (164KB, quality 85) alongside
the existing `hero.jpg` (267KB), served via a `<picture>` element with a
`type="image/webp"` `<source>` and the JPEG as fallback — browsers that support
WebP get the smaller file automatically, no code branching needed.

**Tablet (768px)**: the spec offered two acceptable options ("layout vertical
elegant" or a 2-column split if text doesn't get too narrow). Went with the
simpler, lower-risk option — since the grid only switches to 2 columns at `lg`
(1024px), 768px naturally falls into the same stacked mobile-style layout,
which is explicitly one of her two sanctioned outcomes, rather than adding a
separate `md:grid-cols-*` variant for a narrow 768–1023px band.

**Verified**: `tsc --noEmit` (clean, same pre-existing error only), `npm run
build`, `npx vitest run` (41/41 unrelated tests still pass), Playwright
screenshots at all 5 required breakpoints (full-viewport captures at natural
scroll position — an early attempt used Playwright's `element.screenshot()`,
which scrolls the target element to the top of the viewport before capturing
and made it look like the sticky header overlapped the title; that was a
screenshot-capture artifact only, not a real bug, confirmed by re-shooting the
full viewport at scroll position 0, which is what an actual visitor sees), a
horizontal-overflow check at each breakpoint (`scrollWidth === clientWidth`
everywhere, no overflow), and a direct `getComputedStyle` check of every
element's real rendered font-size/line-height/height/border-radius/max-width
at 390px and 1440px against the spec's numbers (caught one miss this way — the
subtitle was 16px at every breakpoint instead of 18px at desktop specifically;
fixed and re-verified before considering this done).

**Follow-up — the 3 quick-question chip texts swapped.** User asked to replace
only the 3 `quickQuestions` strings (icons/layout/colors/spacing/everything
else explicitly "do not touch"): "Fructele seara îngrașă?" → "De ce nu slăbesc
deși mănânc puțin?", "De ce mi-e foame" → "Cum arată o masă echilibrată?",
"Sunt toate caloriile la fel?" unchanged. Icons stay mapped to their original
position (Clock/Minus/Heart) per her "don't change icons" instruction, even
though Clock no longer thematically matches its new question — that's a
deliberate literal-instruction-over-semantic-fit call, not an oversight.

**Caught a real acceptance-criteria conflict before shipping**: the new first
question is long enough that in the existing `grid-cols-2` mobile chip layout,
it wrapped to 3 lines at 390px/360px — but she'd explicitly capped this at
"maximum 2 rânduri" and separately forbidden shrinking the font to force fewer
lines. Height alone (her suggested fix for "needs more space") can't reduce a
width-bound line count. Resolved by giving just that first chip `col-span-2`
(full-row width) on mobile only — same card style/height/icon/font, just its
own row instead of sharing one with a second chip; chips 2–3 then share the
next row. `col-span-2` is a no-op under the `lg:flex lg:flex-wrap` desktop
layout, so desktop is unaffected. Re-verified: 1 line at 390px, 2 lines at
360px, both within the cap; desktop unchanged (all 3 in one row). No horizontal
overflow at either width.

## Site images

`public/images/` now exists with 3 of the 4 missing files, added this session:
- **`portrait.png`** — real photo of Camelia Amuza (About.tsx). The user first shared a
  different "portrait" candidate (studio-style, books + sunflowers on a desk) that was
  flagged and **rejected**: one book spine in a companion photo from the same set read
  "Dind Dietrition Cand Nutrition Case Studies" — garbled nonsense text, a classic AI
  image-generation tell — so that whole set was very likely AI-generated, not real
  photos of her. Using a fake photo as a named healthcare provider's identity photo on
  a medical site was flagged as a trust issue, not just aesthetics. The user then sent
  an actual phone photo (real, unstaged, plain background) which is what's live now.
  It arrived rotated 90°; fixed with Pillow (`img.rotate(-90, expand=True)`) before
  saving, resized to 900×1200 (native ratio was already exactly 3:4).
- **`blog-myths.png`** / **`blog-med.png`** (`Blog.tsx`) — real food photography the
  user provided (flat-lay ingredients / protein+carb+fat plates split by source),
  already 16:9, resized to 1280×720. No AI-artifact concerns on these two (no legible
  text to check, styling reads as genuine editorial/stock photography).
- **`hero.jpg`** — done, no longer missing. (Two other candidate photos from the
  original rejected AI-generated set — a "Diet4Life journal" product mockup with
  English text and sections like hydration/stress/sleep/weekly-reflection that
  don't exist in the actual site's PDF journal — were flagged and **not used**
  back when this was still open: using them would have visually promised a
  product different from what `/consultatii` actually generates. That's why it
  stayed broken for a while rather than being filled with a placeholder.)
  Resolution: user sent a candidate flat-lay food photo (broccoli, spinach,
  tomatoes, blueberries, carrot ribbons, quinoa/millet, pumpkin seeds, yogurt,
  egg, almonds, citrus, grapefruit — "editorial, legat de nutriție și stil de
  viață", her own words for the brief) and asked for an editor's opinion. Flagged
  one real issue: it was 4:3 (1448×1086) but the hero container is
  `aspect-square`, so an automatic `object-cover` crop would've cut into the
  broccoli (left) and grapefruit/carrot (right), which sit close to that image's
  edges. Gave her the exact target spec (1:1, min 1200×1200, ideally 1600×1600)
  rather than cropping it myself, since she preferred to regenerate; she came
  back with a proper square version (1254×1254, same composition with more
  breathing room from the edges). Installed it — but as **`hero.jpg`, not
  `hero.png`**: the square PNG she sent was 2.2MB, way too heavy for a homepage
  hero, so it was re-encoded as an optimized JPEG (quality 88) at 267KB (~88%
  smaller) with no visible quality loss, and `Home.tsx`'s `<img src>` updated to
  match. This is the one place this session where a user-provided image *was*
  re-encoded — different from the Nutri character image and the logo crops,
  which came with an explicit "don't modify" instruction; this hero photo had no
  such instruction and re-encoding for file size is a lossless-to-the-eye
  technical optimization, not a content change. Verified with `tsc --noEmit`
  (clean, same pre-existing error only), `npm run build`, and a Playwright
  screenshot of the hero section confirming the full composition renders with no
  cropping.

## Checkout & payments architecture — Phase 1 — done

User requested a full checkout/payment architecture (digital products, nutrition
services, consultations), NETOPIA Payments API v2 eventually, buyer/patient data
separation, no medical data in checkout. Went through two rounds of written
architecture proposal (delivered as a copyable artifact, per her request) before
any code: v1 (initial A–H proposal) then v2, revised per her 10 corrections
(Netlify Database package choice, `purchaseMode` on services instead of a blanket
CTA swap, no invented NETOPIA credentials, no fictitious products in the UI,
legal pages structural-only with a draft banner, no raw payment payload storage,
a random public status token instead of the sequential order number, payment
confirmation decoupled from invoicing/email/delivery status). **She then approved
Phase 1 only** — DB + schema + migrations + checkout UI + order creation, **no
live/sandbox NETOPIA, no callback, no invoicing, no email, no digital delivery**.
Everything below is Phase 1. Do not start Phase 2 without her explicit approval.

### Netlify Database — verified facts, not assumptions

Before writing anything, actually ran `netlify database init` in an isolated
throwaway folder (outside this repo) to see what it really scaffolds, since her
correction #1/#2 explicitly said not to describe it as Drizzle-mandatory and not
to build around the legacy `NETLIFY_DATABASE_URL` var. Confirmed:
- **`@netlify/database@2.0.1`** is the current package (not the legacy
  `@netlify/neon`). `netlify database init` scaffolds `drizzle.config.ts` +
  `db/schema.ts` (Drizzle ORM, TypeScript) + `netlify/database/migrations/`
  (SQL auto-generated by `drizzle-kit generate`, never hand-written).
- **Two different env vars exist, for two different purposes**: `drizzle-kit`
  (CLI-time migration generation) defaults to reading `NETLIFY_DATABASE_URL`
  in the scaffolded config; the **app runtime** (`getDatabase()`/
  `getConnectionString()` from `@netlify/database`, called from our functions)
  reads **`NETLIFY_DB_URL`** (+ optional `NETLIFY_DB_DRIVER`). Per her explicit
  correction, `drizzle.config.ts` here was changed to read `NETLIFY_DB_URL` too
  (not the legacy name) — verified this doesn't break the local CLI flow
  (`netlify database migrations apply`/`status` still worked after the change,
  confirmed by actually running them).
- Both vars are **injected automatically by Netlify** per deploy context
  (production/branch-deploy/preview each get their own, via Netlify DB's Neon
  branching) — never set by hand, and per her correction #2, **no `.env.example`
  was created for DB credentials** since there's nothing to document that Netlify
  doesn't already manage.
- Real commands verified by running them: `netlify database init`,
  `migrations new --description "..."`, `migrations apply`, `migrations pull`,
  `status`, `reset`, `connect`.
- New deps: `@netlify/database`, `drizzle-orm` (dependencies), `drizzle-kit`
  (devDependency) — all `1.0.0-beta.22`/`2.0.1` as installed by the real CLI
  scaffold, not picked by hand.

### Schema (`db/schema.ts`, Drizzle)

`products`, `orders`, `billing_details`, `patient_details`, `payments` — matches
the approved v2 plan exactly, including the corrections:
- `orders.public_status_token` (32-byte random, base64url) is the **only**
  identifier ever exposed to the browser for status lookups.
  `orders.order_number` (`D4L-<year>-<8 hex chars>`) is human/invoice-facing
  only, never used for lookup.
- `orders.invoice_status` / `confirmation_email_status` / `delivery_status`
  (delivery nullable, only set for `digital_product`) exist as **independent**
  tracking columns — `status = paid` is never gated by them (Phase 2 rule,
  schema already supports it).
- `payments` has explicit columns only (`provider_transaction_id` UNIQUE,
  `provider_status`, `amount_cents`, `currency`, `created_at`/`updated_at`/
  `last_event_at`) — **no raw payload column**, per her correction #6. Table
  exists but nothing writes to it yet (no NETOPIA integration in Phase 1).
- `billing_details`/`patient_details` are separate tables, 1:1 with `orders`,
  joined only by `order_id` — no shared columns, no medical fields anywhere,
  no CNP field.
- First real migration: `netlify/database/migrations/*_init_checkout_schema/`
  — applied and verified against a real local Postgres (see Verification below).

### Server (`netlify/functions/`, `src/server/`)

- `netlify/functions/products-list.ts` — `GET`, filters `WHERE active = true`
  server-side, returns only real fields (no internal columns).
- `netlify/functions/orders-create.ts` — `POST`, validates with
  `checkoutSubmissionSchema` (zod), resolves price **only** from the DB
  (verified a client-supplied `priceCents` in the payload is silently ignored —
  the schema doesn't even have that field), requires `patient` for
  `nutrition_service`/`consultation`, creates `orders`+`billing_details`(+
  `patient_details`), retries on order_number/token collision (Postgres unique
  violation, code `23505`).
- `netlify/functions/orders-status.ts` — `GET ?token=`, resolves **exclusively**
  by `public_status_token`, returns only `orderNumber/status/productName/
  productType/totalCents/currency/invoiceStatus/deliveryStatus` — verified a
  random/wrong token returns a plain 404, not an error that leaks anything.
- `src/server/db/client.ts` — `getDb()`: wraps `@netlify/database`'s
  `getDatabase()` pool with Drizzle's schema-typed client. **Not in the original
  file list** — a small necessary glue file, flagged below under "unforeseen
  decisions."
- `src/server/security/publicToken.ts` — token/order-number generation.
- `src/server/orders/orderService.ts` — all DB writes/reads for orders; the one
  place prices are resolved.

### Frontend

- `src/lib/checkout/types.ts` / `schemas.ts` — shared types + zod schemas
  (individual/company billing discriminated union, patient with
  `sameAsBuyer`-conditional validation via `superRefine`, consent as
  `z.literal(true)` fields). No `src/lib/catalog/products.ts` static file —
  decided the DB `products` table is the single source of truth instead of
  duplicating it in a TS file (deviation from the original v2 file list, flagged
  below).
- `src/lib/catalog/services.ts` — **new**, per correction #2: every existing
  Services.tsx offering (Consultație 300 lei, Ghidaj WhatsApp 150 lei, Pachetele
  Start/Echilibru/Transformare) modeled with `purchaseMode: "checkout" |
  "contact"`, **all currently `"contact"`** — matches Services.tsx's current
  unchanged behavior exactly. **`Services.tsx` itself was deliberately NOT
  refactored to consume this file** — since every item is still `"contact"`,
  there is nothing to change in its rendered output yet, and touching it would
  violate her "don't modify pages without direct technical necessity" rule.
  Wiring it in for real is a Phase-2-or-later task, once she approves a specific
  item for checkout.
- `src/pages/Checkout.tsx` (`/checkout/:slug`) — single page, sectioned (not a
  multi-route wizard): billing → patient (conditional on product type) → order
  summary → consents → submit. Fetches the product client-side from
  `products-list` and matches by slug (no dedicated single-product endpoint
  needed yet, catalog is small).
- `src/components/checkout/` — `BillingForm`, `PatientForm`, `OrderSummary`,
  `ConsentSection`, `PaymentButton`, `StatusStates`.
- **`PaymentButton` is deliberately honest about Phase 1's scope** — does NOT
  say "Plătește securizat" (that would claim a real charge that can't happen
  yet). Says "Trimite comanda — {total}" with a small note that online payment
  is coming soon. Submitting creates a real `pending_payment` order and
  redirects to `/checkout/retur?token=...`, which will legitimately keep
  showing "payment pending" forever until Phase 2 adds a real NETOPIA callback
  — never a fake "paid" state. This is a deliberate scope-honesty choice, not
  an oversight; swap the copy once Phase 2 lands.
- `src/pages/CheckoutReturn.tsx` (`/checkout/retur?token=`) — structural retour
  page (explicitly allowed in Phase 1, item 13). Reads `?token=` only, calls
  `orders-status`, renders via `StatusStates` (handles every status the schema
  defines: `pending_payment`/`payment_processing` → "registered, pending";
  `paid` → the two product-type-specific success variants from the original
  spec; `payment_failed`/`cancelled` → retry CTA; `refunded`).
- `src/pages/Termeni.tsx` / `Confidentialitate.tsx` — structural routes only.
  `src/components/legal/DraftNotice.tsx` — single `LEGAL_COPY_APPROVED = false`
  flag renders a visible amber banner ("Text provizoriu, intern — nu reprezintă
  versiunea finală aprobată legal.") on both; flip only once she approves real
  text. No legal wording was invented beyond that placeholder sentence.
- `src/pages/Products.tsx` — rewritten to fetch from `products-list` and render
  **only** `active` real products; the 3 old fictitious ones are gone entirely
  (not just hidden). Empty catalog renders a calm "va fi disponibil în curând"
  message rather than a broken-looking blank grid.
- `src/App.tsx` — 4 new routes. `/checkout/retur` is registered **before**
  `/checkout/:slug` in the `Switch` (wouter matches in order — otherwise
  `:slug` would swallow "retur" as a slug value).

### A real bug found and fixed (not in the original plan)

`drizzle-orm@1.0.0-beta.22` changed its `drizzle()` signature: the classic
`drizzle(pool, config)` positional call is **silently** misread as a connection
config object in this beta — `pool` has no `.client`/`.connection` property, so
it falls through to constructing a **brand new, unconfigured pool** defaulting
to `127.0.0.1:5432`, instead of throwing. This produced a confusing
`ECONNREFUSED 127.0.0.1:5432` even though the real pool (built by
`@netlify/database`) was independently verified correct. Root-caused by reading
the installed `drizzle-orm/node-postgres/driver.cjs` source directly, then
confirmed the fix by testing both call styles in isolation against a real
Postgres. **Fix**: `src/server/db/client.ts` calls `drizzle({ client: pool,
schema })` (named property), not `drizzle(pool, { schema })`. Left a comment on
the fix explaining why, since this is exactly the kind of beta-API trap that's
easy to silently reintroduce.

### Verification (Phase 1, no Netlify auth/live network available in this sandbox)

`netlify dev`'s full proxy fails here (tries to download the Edge Functions
runtime from `*.netlify.app`, blocked — same documented sandbox constraint as
everywhere else in this file). Worked around it for real end-to-end testing:
- Confirmed `@/` tsconfig path aliases resolve correctly in Netlify's function
  bundler (esbuild) — bundled each function directly with `esbuild --bundle` and
  inspected/ran the output; also confirmed via `netlify functions:serve`
  (lighter-weight than full `dev`, no Edge Functions download) that "Loaded
  function ..." succeeded for all three.
- Stood up a throwaway local Postgres 16 cluster (system binaries, run as the
  `nobody` user since Postgres refuses root) in `/tmp`, applied the real
  generated migration SQL directly, seeded test products, and ran the actual
  bundled function handlers against it directly in Node (bypassing the CLI
  proxy layer entirely) — this is how the drizzle-orm bug above was found and
  confirmed fixed.
- Full browser smoke test (Playwright, vite dev + `netlify functions:serve`
  wired together via a **dev-only** proxy added to `vite.config.ts` for
  `/.netlify/functions/*` → `localhost:9999`; has zero effect on the real
  Netlify build/deploy, where static assets and Functions already share one
  domain natively): digital-product checkout (individual billing) end to end
  including a submit-without-consent validation-error state; consultation
  checkout with company billing + patient different from the buyer; empty/real
  Products.tsx catalog; Termeni.tsx draft banner. No horizontal overflow at
  390px or 1280px.
- **Caught and fixed a real crash this way**: `ConsentSection.tsx` originally
  used shadcn's `<FormMessage>` directly for the two consent checkboxes'
  errors — that component calls `useFormField()`, which throws if it isn't
  rendered inside a `<FormField>`/`<FormItem>` (the consent checkboxes are
  hand-wired, not through `FormField`'s render-prop pattern). First submit
  attempt with an unmet consent crashed the whole page to blank. Fixed by
  rendering the error as a plain `<p>` styled to match `FormMessage`'s own
  className instead.
- `tsc --noEmit` clean (same one pre-existing unrelated error), `npm run
  build` clean, `npx vitest run` 41/41 (untouched, unrelated tests). Verified
  the client bundle contains zero server-only DB code (`pg`/`drizzle-orm`/
  `@netlify/database` do not appear in `dist/assets/*.js`).
- Scratch Postgres and its data directory were torn down after testing; nothing
  from it persists in the repo. `.env`/`.env.local` added to `.gitignore`
  (previously absent) since Phase 2 will need one for local NETOPIA sandbox
  keys.

### Deviations from the approved file list — flagged, not silent

1. **No `src/lib/catalog/products.ts`** — the DB `products` table is the single
   source of truth; a static duplicate file would just be a second place to
   keep in sync. `products-list`/`Products.tsx` read from the DB directly.
2. **`src/server/db/client.ts` added** — a small wrapper (`getDb()`) combining
   `@netlify/database`'s connection with Drizzle's schema-typed client. Wasn't
   itemized in the approved v2 list; without it there's no typed ORM access
   from any function.
3. **`vite.config.ts` got a dev-only proxy** for `/.netlify/functions/*` — pure
   local-DX convenience (lets `npm run dev` reach a separately-running
   `netlify functions:serve`), no effect on the production build or Netlify
   itself.
4. **`Services.tsx` was not touched** despite `services.ts` (catalog with
   `purchaseMode`) being added — see Frontend section above; every item is
   still `"contact"`, so there's nothing to change in its rendered output.
5. **drizzle-orm's `drizzle({ client, schema })` vs `drizzle(pool, config)`**
   — see "A real bug found and fixed" above.

### Explicitly NOT done (Phase 2/3, needs separate approval)

NETOPIA live/sandbox integration, `payments-initiate`/`payments-netopia-callback`
functions (not created), SmartBill/FGO invoicing, transactional email, secure
digital-product delivery, real legal copy, real NETOPIA env vars. `PaymentButton`
creates a `pending_payment` order and stops there by design.

## Checkout UI/UX refinement round — done

User asked to keep the Phase 1 architecture exactly as-is but refine the checkout's
UI/UX before Phase 2. Explicitly allowed touching schema/logic only where the UX
ask required it (name field consolidation, country code) — nothing else in the
order-creation flow or DB structure changed.

- **Desktop two-column layout** (`Checkout.tsx`): `lg:` grid, left column =
  billing form → patient section (conditional) → consents; right column = a
  `sticky top-24` card with `OrderSummary` + `PaymentButton` together, staying
  visible while the form is filled in. Below `lg` (mobile/tablet): single
  column, order = form → patient → order summary → consents → CTA, exactly
  per spec. Implemented via a small `useMediaQuery` hook (`src/hooks/use-
  media-query.ts`, matches the site's own `lg` breakpoint at 1024px) rather
  than duplicating the same components in two hidden/visible DOM trees —
  duplicat­ing would have meant two live copies of every input `id`/
  `data-testid` at once, which breaks both accessibility and testability
  even when only one copy is visually shown.
- **Name field simplified** — individual billing and patient both now use a
  single "Nume și prenume" / "Full name" field instead of separate Prenume/
  Nume. **Real DB schema change**: `billing_details`/`patient_details`
  dropped `first_name`+`last_name`, added `full_name` — a clean drop+add
  migration (not a rename, since combining two columns into one isn't a pure
  rename anyway). Company/PFA billing is untouched (still `companyName` +
  `taxId` etc., separate fields, per explicit instruction to keep those
  separate).
- **Country — real DB schema change**: `billing_details.country` (free-text,
  defaulted to "România") replaced with `billing_details.country_code`
  (ISO 3166-1 alpha-2, e.g. "RO"/"DE"/"US", default "RO"). Never hidden,
  never hardcoded to Romania — a searchable combobox
  (`src/components/checkout/CountrySelect.tsx`, built from the existing
  shadcn `Command`+`Popover` primitives, no new dependency) backed by a new
  `src/lib/checkout/countries.ts` (ISO code + RO/EN localized name, ~100
  countries covering the EU, the Americas, the Middle East, and the largest
  Asian/African economies — a representative list for a first release, not
  the full ~195-entry ISO set; trivial to extend, it's just a data array).
  The UI always shows the localized name; the DB always stores the code.
- **International address labels** — no new columns needed: `county`/`city`/
  `street_address` are reused for every country, but their *labels* switch
  based on the selected `countryCode` — "Județ / Sector" / "Localitate" /
  "Stradă și număr" for Romania, "Stat / Regiune / Provincie" / "Oraș" /
  "Adresă" (localized) for everywhere else. Verified end-to-end: selecting
  Germany relabels the fields live, filling them in and switching back to
  Romania correctly relabels again with no data loss, and the submitted
  order stored the right `country_code`.
- **Patient section wording** — "Eu sunt pacientul" → "Serviciul este pentru
  tine?" / "Da, eu voi beneficia de serviciu"; when unchecked, the heading
  is now "Datele persoanei pentru care cumperi serviciul" with a single
  "Nume și prenume" field (matching the billing simplification) + email +
  telefon. No medical fields, as before.
- **CTA text** — "Trimite comanda" → "Continuă către plată — {total}"
  (`PaymentButton.tsx`), since "Trimite comanda" read as if the order itself
  was the end state; "Continuă către plată" more accurately signals a
  payment step is still coming. Trust line changed to "Plata online va fi
  procesată securizat." Still **not** "Plătește securizat" and still no
  card-network badges — those are explicitly reserved for once NETOPIA is
  actually wired up in Phase 2, per her explicit "IMPORTANT" instruction.
- **Consents simplified** — Privacy Policy is no longer a second mandatory
  checkbox. `consentSchema` (zod) now only requires `termsAccepted`;
  `ConsentSection.tsx` shows the Terms checkbox plus a plain informational
  sentence ("Prin continuarea comenzii confirmi că ai luat la cunoștință
  Politica de confidențialitate.") with a working link. No DB change needed
  — consent was never persisted as a column in Phase 1 to begin with.
- **Demo product exclusion** — confirmed by repo-wide grep that no
  "Ghid Nutrițional PDF (demo)"-style data ever existed in git; the demo
  products seen in earlier screenshots only ever lived in a throwaway local
  Postgres instance used for testing, never committed. `Products.tsx`'s
  empty-state copy updated to the exact requested two lines ("Materialele
  Diet4Life sunt în pregătire." / "Lucrăm la ghiduri și instrumente
  practice...") with no price or CTA shown when the catalog is empty.
- **Required-field asterisks + roomier inputs** — every required field label
  now ends in `*`; checkout inputs use `h-11` (44px) instead of the shared
  `Input` component's site-wide default `h-9` (36px) — scoped to checkout
  only via a per-field className, not a global `Input` component change,
  so no other page's inputs are affected. Spacing between fields increased
  (`gap-5`, was `gap-4`) for a calmer, less "tax form" feel on mobile.
- New migration: `netlify/database/migrations/*_checkout_ux_refinements/`
  — generated with `drizzle-kit generate` (interactively confirmed via a
  scripted `pexpect` session, since the CLI's rename-detection prompt
  requires a real TTY; all three column changes were correctly resolved as
  "create column", not "rename", matching the intent). Also picked up one
  small pending diff from the previous session that hadn't been migrated
  yet (`orders.invoice_status` default `not_required` → `pending`).
- Verified exactly like Phase 1: a scratch local Postgres (system binaries,
  run as `nobody`), both migrations applied in sequence, real order
  submissions end-to-end for both a digital product (mobile) and a
  consultation with a non-buyer patient and a mid-flow country switch
  (desktop) — confirmed via direct SQL query that `full_name`/`country_code`
  landed correctly. `tsc --noEmit` clean (same one pre-existing unrelated
  error), `npm run build` clean, `npx vitest run` 41/41. No horizontal
  overflow at 390px.
- One real flake caught and understood, not a bug: the very first page load
  after adding `CountrySelect` (which pulled in `cmdk`/`@radix-ui/react-
  popover`/`@radix-ui/react-dialog` for the first time) triggered Vite's
  "new dependencies optimized... reloading" dev-server restart mid-request,
  producing one blank screenshot. Not present on any subsequent load once
  Vite's dependency pre-bundle cache was warm — a known Vite dev-server
  characteristic, not a code defect, and doesn't happen in a production
  build (`vite build` bundles everything upfront, no on-demand optimization
  step exists there).

## Checkout Phase 1 final polish round — done, awaiting user approval before Phase 2

User approved the visual direction from the UX-refinement round above and asked for
one last polish pass before considering Phase 1 complete, with an explicit "do not
start Phase 2" and "keep the current architecture/design, only touch the 11 points
below" framing. All 11 points implemented; nothing else in the checkout flow touched.

- **Demo/production separation (the headline requirement)** — "Ghid Nutrițional PDF
  (demo)" / "Consultație de nutriție (demo)" must never be visible in production, and
  the implementation must *prevent* accidental publishing, not just hide it in the UI.
  Real DB schema change: `products.is_demo` (boolean, default `false`). New
  `src/server/environment.ts` (`isProductionContext()`, reads Netlify's own `CONTEXT`
  runtime var — never a header, hostname, or anything client-spoofable) is checked in
  two places:
  - `orderService.ts`'s `listActiveProducts()` adds `AND is_demo = false` to the query
    whenever `isProductionContext()` is true — demo rows are simply never returned to
    a production request, regardless of their `active` flag.
  - `orderService.ts`'s `createOrder()` throws a new `CheckoutDisabledInProductionError`
    as its very first line whenever `isProductionContext()` is true — **no order can be
    created in production at all**, full stop, since there's no real payment provider
    yet (Phase 2). `orders-create.ts` maps this to a `503 { error: "checkout_disabled" }`.
    Verified directly with `curl` against the bundled function (bypassing the UI
    entirely) that this fires even with a hand-crafted request.
  - Client-side mirror, defense-in-depth only (the guards above are the real,
    authoritative ones): `src/lib/checkout/environment.ts` (`isProductionBuild()`)
    reads a new `__NETLIFY_CONTEXT__` global baked into the bundle by a `vite.config.ts`
    `define` block from `process.env.CONTEXT` **at build time** — confirmed by grepping
    the built JS that esbuild's minifier statically eliminates the losing branch
    entirely (a production build's bundle contains zero occurrences of the working
    "Continuă către plată" button text; a dev build's bundle contains zero occurrences
    of the disabled-panel's testid) — a stronger guarantee than a runtime-only check.
    `PaymentButton.tsx` renders a plain informational panel in production ("Plățile
    online nu sunt încă disponibile." / "Revino în curând sau contactează-ne...")
    instead of any button; `Checkout.tsx`'s `onSubmit` also short-circuits with a toast
    in production, so even an Enter-key submit can't call the disabled endpoint.
  - **Caveat, flagged rather than assumed**: confident `CONTEXT` is set at Netlify's
    build step; not independently verifiable from this sandbox whether it's also
    reliably injected into the Functions *runtime* on every deploy context — worth a
    quick real-deploy check before fully trusting the server-side guard alone.
- **Country selector polish** — `CountrySelect.tsx` converted to `forwardRef` and now
  accepts/forwards `id`/`aria-describedby`/`aria-invalid` — previously a plain function
  component, so shadcn's `<FormControl>` (a Radix `Slot`) silently couldn't wire up
  the label/error/invalid-state association at all (a real, pre-existing accessibility
  gap, not something the UX round introduced). Also added: an explicit `aria-label`
  on the trigger and the search input; `min-h-11` (44px) touch targets on each option
  (was relying on cmdk's smaller default); diacritic-insensitive search (`.normalize
  ("NFD").replace(/[̀-ͯ]/g, "")` on both the query and each candidate) so
  typing "Franta" without the ț still finds "Franța" — verified directly with
  Playwright. Escape closes the popover and selecting an option closes it — both were
  already correct shadcn/Radix `Popover` behavior, verified rather than assumed.
  Selection remains the only way to set the value (no free-text path), so an
  out-of-list code can never reach form state.
- **Postal code — real validation change** — was unconditionally optional; now
  `isPostalCodeRequired(countryCode)` (`src/lib/checkout/countries.ts`) returns `false`
  only for a short, explicit list of countries where postal code isn't part of a normal
  billing address (UAE, Qatar, Hong Kong) and `true` everywhere else, wired into
  `billingSchema` via `.superRefine()`. Deliberately no per-country regex/format
  validation at this stage (per the explicit "don't invent restrictive regexes" ask) —
  just required-or-not, free text either way, so no valid real-world postal code can
  ever be rejected.
- **Desktop layout widened** — `Checkout.tsx`'s grid changed from
  `grid-cols-[1fr_360px] gap-10` to `grid-cols-[1fr_340px] gap-12` — a narrower, fixed
  summary column frees up real width for the form column without shrinking any input.
  Sticky behavior re-verified beyond the original round's single mid-scroll screenshot:
  tested a viewport taller than the entire page (worst case for "shouldn't overrun the
  footer") and scrolled all the way to the bottom — in both cases the sticky card's
  computed bounding box stays strictly between the header's bottom edge and the
  footer's top edge. Confirmed disabled entirely below `lg` (single sticky element on
  a mobile viewport is the site's own header, not the order card).
- **Return/status page enriched** — `StatusStates.tsx` rebuilt around a shared
  `StatusCard` (icon + a text-and-icon pill, never color alone + title + product/amount
  + explanation + CTA slot), used by all four status branches. The realistic Phase 1
  state (`pending_payment`) now reads, verbatim: title "Comanda a fost înregistrată",
  explanation "Plata online nu este activă în această versiune de test. Nu a fost
  efectuată nicio plată." — never "Plata a fost efectuată" / "Comanda este confirmată"
  anywhere in that branch. `CheckoutReturn.tsx`'s missing-token/not-found state now
  uses the same card shell for visual consistency (previously bare text).
- **Consent accessibility fix** — the Terms checkbox's validation error
  (`ConsentSection.tsx`) was rendered as a plain, visually-adjacent `<p>` with no
  programmatic link back to the checkbox. Now the error paragraph has a stable `id`
  and the checkbox carries a conditional `aria-describedby`/`aria-invalid` pointing at
  it — verified via Playwright that submitting without checking the box sets
  `aria-invalid="true"` and `aria-describedby` resolves to the exact error text.
- **Beneficiary wording / consent copy** — both already matched the requested exact
  wording from the UX-refinement round; re-verified byte-for-byte against this round's
  spec, no changes needed.
- **Mobile sweep** — 360/390/412/430px all checked for horizontal overflow
  (`scrollWidth === clientWidth` at every width) both on the plain checkout form and
  with the country dropdown open; no clipping, no edge-stuck elements observed.
- New migration: `netlify/database/migrations/*_demo_flag_and_polish/` — a single
  `ADD COLUMN is_demo boolean NOT NULL DEFAULT false`, no renames, no interactive
  `drizzle-kit` prompt needed.
- Verified with the same methodology as every prior round (scratch local Postgres +
  `netlify functions:serve` + `vite`, both restarted once under `CONTEXT=production`
  to exercise the production-only branches for real): `tsc --noEmit` clean (same one
  pre-existing unrelated error), `npx vitest run` 41/41 unrelated tests unaffected,
  `npm run build` clean (same pre-existing chunk-size warning only). Scratch Postgres
  and both dev servers torn down after testing; nothing from them persists in the repo.

## Known pre-existing issues (not caused by us, not yet fixed)

- `src/pages/*.tsx` used to reference `/images/hero.png`, `/images/portrait.png`,
  `/images/blog-*.png`, `/images/recipe-*.png` (recipe ones now moot, page
  removed). **All 4 originally-missing images are now resolved** — `portrait.png`,
  `blog-myths.png`, `blog-med.png`, and `hero.jpg` (note the extension change,
  see "Site images" above) are all in `public/images/` and live. Nothing broken
  left in this list.
- `tsc --noEmit` reports one pre-existing error unrelated to any of our changes:
  `src/App.tsx: Property 'env' does not exist on type 'ImportMeta'` (missing
  Vite client types in `tsconfig.json`) — vite build itself succeeds fine.

## Netlify

- Site: `diet4life` (id `fb46b783-0032-4b51-971b-b255c590f8b8`), team requires
  SSO login to view any deploy.
- Linked repo: `github.com/Diet4life/Diet4life-site`. Build command
  `npm run build`, publish directory `dist`, base directory `/`.
- Do not deploy/merge to production without explicit user confirmation — see
  the live-site mismatch section above for why.
- **Netlify Database (Postgres/Neon) + Functions added this session** — see
  "Checkout & payments architecture — Phase 1" above. `netlify.toml` now has a
  `[functions]` block (`netlify/functions`, esbuild bundler). The actual cloud
  database for this site has not been provisioned/linked from this sandbox
  (no Netlify auth here) — `NETLIFY_DB_URL` etc. will be injected automatically
  by Netlify once the site is deployed with `@netlify/database` in
  `package.json`; nothing to configure by hand.
