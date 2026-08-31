# Diet4Life Concept — project notes

React + Vite + TS + Tailwind + shadcn/ui (Radix) + Framer Motion + wouter routing.
Bilingual (RO/EN) via `src/contexts/LanguageContext.tsx`. Branch for ongoing work:
`claude/tool-usage-check-htkbjz`.

## Environment constraint — read this first

This sandbox's network egress is allowlisted and **cannot reach `*.netlify.app`,
CloudFront, or basically anything outside the allowlist** (verified: `curl` to
`diet4life.netlify.app` gets `CONNECT tunnel failed, response 403`; same for
`WebFetch`). There is no workaround. **The live site cannot be viewed directly
from this environment — screenshots from the user are the only way to see it.**
Don't re-attempt fetching it; ask for a screenshot instead.

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
   fel?" hero question card.
   **Not yet confirmed whether the homepage ends here or continues further —
   ask user for more screenshots (footer etc.) before finalizing the rebuild.**

`/consultatii` page — live version has a "Cum funcționează" (How it works) block
tied to the food-journal PDF flow, not present in git's `Consultatii.tsx`:
1. Descarcă și printează jurnalul PDF
2. Sau completează-l direct online în tab-ul următor
3. Încarcă fișierul completat (PDF, DOCX, JPG, PNG)
4. Trimite-l pe email la contact@diet4lifeconcept.ro
This ties into the same "Jurnal alimentar" feature as the homepage card above —
likely the same feature, reached two ways (a downloadable/printable PDF journal,
or an online form). Scope/implementation not yet decided.

Nav on live site: Acasă · Despre Mine · Servicii · **NutriHub** · Calculator ·
Rețete · Produse · Consultații (+ RO/EN, Contact button). Note **Rețete is still
in the live nav** — expected, since we've only removed it from git so far, not
yet redeployed.

## Content policy decided this session

- **Bariatric nutrition: remove everywhere, including in the rebuild.** No
  partnership agreement yet with the collaborating clinic; must not be public.
  Already scrubbed from git (services, blog, products, education, contact form,
  about page, nutrition page — the whole `/nutrition` page was bariatric-only
  and was deleted). Apply the same exclusion to anything pulled in from the live
  site (e.g. the "Nutriție bariatrică" NutriHub card above).
- **Recipes section: removed from git** (route, nav link, page, translation key).
  Still appears live because that hasn't been redeployed yet — expected, not a bug.
- Two images sent mid-conversation by the user were unrelated personal/medical
  content (hair-loss treatment prescription) — pasted by mistake, explicitly
  disregarded, not part of the project.

## Recent work already done (on the working branch, in git)

- Lenis smooth scroll wired to Framer Motion's frame loop
  (`src/components/SmoothScroll.tsx`), respects `prefers-reduced-motion`.
- `ScrollToTop` component resets scroll via the Lenis instance on route change.
- Subtle `active:scale` tactile feedback added to the shared `Button` component.
- BMI/IMC section added to `/calculator` (`src/pages/Calculator.tsx`): computed
  from the weight/height already in the form, WHO-range segmented bar with a
  position marker, bilingual category label.
- `.gitignore` added (didn't exist before; `node_modules`/`dist` were untracked
  by accident).

## Known pre-existing issues (not caused by us, not yet fixed)

- `src/pages/*.tsx` reference `/images/hero.png`, `/images/portrait.png`,
  `/images/blog-*.png`, `/images/recipe-*.png` (recipe ones now moot, page
  removed) — **none of these files exist**, there is no `public/` directory at
  all. Every such image is a broken 404 on the actual built site. User decided
  (earlier in this session) to leave this alone for now — was in the middle of
  regenerating the hero image via an AI image tool when this conversation moved
  on to the live-site reconciliation work above.
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
