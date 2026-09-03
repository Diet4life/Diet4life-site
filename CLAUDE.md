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
- Featured spotlight ("De ce nu toate caloriile sunt la fel?") is static text
  only, no link — its destination 404s live too, nothing written yet.
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
- **Romanian-only for now.** Both article pages check `language`; if not `"ro"`, they
  render a short "this article is only available in Romanian" notice instead of the
  article, rather than machine-translating unreviewed medical content. Fix once real
  English copy exists.
- Related-article links without an `href` in the `related` array render as a
  non-clickable "în curând"/"coming soon" chip — used for all the secondary articles
  listed in "Still open" below that don't exist yet.

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

## Still open / not yet done

- The secondary/deep-dive articles referenced from "Citește și" on both NutriHub
  pillar pages don't exist yet: "Câtă proteină am nevoie?", "Fibrele alimentare...",
  "Câte calorii am nevoie?", "Sunt toate caloriile la fel?", "De ce nu slăbesc deși
  mănânc puțin?", "Ce este platoul ponderal?", "Produsele pentru slăbit...". Each is
  currently a disabled "coming soon" chip in the `related` list, not a broken link.
- The "De ce nu toate caloriile sunt la fel?" article (linked from the homepage
  spotlight, not NutriHub) still doesn't exist anywhere (live or git) — separate task.
- Hero image (`/images/hero.png`) is still broken/missing — user is separately
  regenerating it with an AI image tool; reused the same path so it'll pick up
  automatically once they drop the file in.

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
  icon). Note: the *hub's own name* stays "Educație & Prevenție" (`nav.education`,
  `edu.hero.title`, `edu.backhub`) — that's the section's general nav label, distinct
  from the specific subpage that was removed, and wasn't touched.
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
- **`hero.png`** — still missing. Two other candidate photos from the same rejected
  AI-generated set (a "Diet4Life journal" product mockup — bound book, English text,
  sections like hydration/stress/sleep/weekly-reflection that don't exist in the
  actual site's PDF journal) were also flagged and **not used**: using them as the
  homepage hero would visually promise a product different from what `/consultatii`
  actually generates (Romanian, loose A4 PDF, no those sections). User's call: leave
  `hero.png` broken for now ("La hero lasam încă asa"), she's handling it separately.

## Known pre-existing issues (not caused by us, not yet fixed)

- `src/pages/*.tsx` reference `/images/hero.png`, `/images/portrait.png`,
  `/images/blog-*.png`, `/images/recipe-*.png` (recipe ones now moot, page
  removed). **`portrait.png`, `blog-myths.png` and `blog-med.png` are now in
  `public/images/` and live** (see next section). **`hero.png` is still
  missing/broken** — user explicitly said to leave it as-is for now
  ("La hero lasam încă asa"), separately regenerating it herself.
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
