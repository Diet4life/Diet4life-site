-- Custom SQL migration file, put your code below! --

-- Seeds the 5 real `products` rows for the Services.tsx checkout
-- offerings, through Netlify Database's own official migration mechanism
-- (applied automatically on deploy) instead of a hand-run SQL console
-- statement. Content is byte-identical to the already-reviewed
-- scripts/seed-services-products.sql (not executed from this session
-- previously -- no network path to the live/branch DB existed). This
-- migration touches ONLY the `products` table, never deletes a row, and
-- is idempotent: `ON CONFLICT (slug) DO UPDATE` means re-running it (e.g.
-- if this deploy is ever re-applied) updates these 5 rows in place rather
-- than erroring or duplicating.
INSERT INTO products (slug, name, short_description, description, price_cents, currency, product_type, active, is_demo)
VALUES
  (
    'primii-pasi',
    'Primii Pași',
    'Pentru persoanele care vor să își înțeleagă mai bine alimentația actuală și să primească recomandări concrete, fără o consultație completă.',
    'Jurnal alimentar 7 zile, analiza alimentației actuale, estimarea necesarului energetic și recomandări pe WhatsApp, urmate de 14 zile de aplicare cu feedback la final.',
    20000,
    'RON',
    'nutrition_service',
    true,
    false
  ),
  (
    'consultatie-nutritionala',
    'Consultație Nutrițională',
    'Pentru persoanele care au nevoie de o evaluare completă și de o strategie nutrițională personalizată.',
    'Consultație de 45-60 de minute: jurnal alimentar 7 zile, evaluarea alimentației și obiectivelor, stabilirea necesarului energetic, recomandări nutriționale adaptate și un plan alimentar orientativ pentru 7 zile.',
    30000,
    'RON',
    'consultation',
    true,
    false
  ),
  (
    'monitorizare-nutritionala',
    'Monitorizare Nutrițională',
    'Pentru pacienții care au avut deja o consultație și au nevoie de o reevaluare punctuală.',
    'O reevaluare punctuală a progresului, cu ajustarea recomandărilor pentru pacienții care au avut deja o consultație completă.',
    20000,
    'RON',
    'nutrition_service',
    true,
    false
  ),
  (
    'program-6-saptamani',
    'Program Nutrițional 6 săptămâni',
    'Pentru persoanele care au nevoie de evaluare, intervenție și ajustări pe parcurs.',
    'Consultație inițială, jurnal alimentar 7 zile, plan alimentar pentru 7 zile, 1 monitorizare de aproximativ 20 minute și clarificări punctuale pe WhatsApp, pe parcursul a 6 săptămâni.',
    48000,
    'RON',
    'consultation',
    true,
    false
  ),
  (
    'program-3-luni',
    'Program Nutrițional 3 luni',
    'Pentru persoanele care au nevoie de intervenție mai amplă și monitorizare pe termen mai lung.',
    'Consultație inițială, jurnal alimentar 7 zile, plan alimentar pentru 7 zile, 3 monitorizări de aproximativ 20 minute (aproximativ una pe lună) și clarificări punctuale pe WhatsApp, pe parcursul a 3 luni.',
    85000,
    'RON',
    'consultation',
    true,
    false
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  currency = EXCLUDED.currency,
  product_type = EXCLUDED.product_type,
  active = EXCLUDED.active,
  is_demo = EXCLUDED.is_demo,
  updated_at = now();
