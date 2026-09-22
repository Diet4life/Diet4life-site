-- Real `products` rows for the 5 Services.tsx checkout offerings.
-- NOT executed from this session (no network path to the live/branch
-- Netlify DB from this sandbox) -- run this yourself against the branch's
-- Netlify DB (e.g. `netlify db:connect` / your usual psql connection),
-- same as the earlier demo-product round. Idempotent: safe to re-run,
-- ON CONFLICT (slug) updates the row in place rather than erroring or
-- duplicating. `active = true` so these are real, purchasable services --
-- do not run this against production until you're ready for that.

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
