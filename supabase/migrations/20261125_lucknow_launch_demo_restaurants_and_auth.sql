-- DineRestro – Lucknow Launch, Fictional Demo Restaurants, Mandatory Auth RLS & Custom Request/Quotation Removal
-- Additive migration: preserves all existing booking and historical payment records.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Multi-City Configuration Table (Lucknow active default; future cities toggleable by Admin)
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_default_launch_city BOOLEAN NOT NULL DEFAULT FALSE,
  neighbourhoods JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_cities_updated_at ON public.cities;
CREATE TRIGGER trg_cities_updated_at BEFORE UPDATE ON public.cities
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.cities (name, state, country, is_active, is_default_launch_city, neighbourhoods)
VALUES
  (
    'Lucknow',
    'Uttar Pradesh',
    'India',
    TRUE,
    TRUE,
    '["Gomti Nagar","Gomti Nagar Extension","Hazratganj","Indira Nagar","Aliganj","Aminabad","Vibhuti Khand","Chowk","Mahanagar","Alambagh","Jankipuram","Sushant Golf City"]'::jsonb
  ),
  (
    'Varanasi',
    'Uttar Pradesh',
    'India',
    FALSE,
    FALSE,
    '["Assi Ghat","Nadesar","Rathyatra","Sigra","Cantonment","Lanka","Dashashwamedh"]'::jsonb
  )
ON CONFLICT (name) DO UPDATE
SET
  state = EXCLUDED.state,
  neighbourhoods = EXCLUDED.neighbourhoods,
  is_active = CASE WHEN public.cities.name = 'Lucknow' THEN TRUE ELSE public.cities.is_active END,
  is_default_launch_city = CASE WHEN public.cities.name = 'Lucknow' THEN TRUE ELSE FALSE END;

-- 2. Restaurants Table (Supports both genuine verified partners and clearly labeled Demo Listings)
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  owner_user_id UUID,
  restaurant_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Lucknow',
  locality TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  cuisine TEXT NOT NULL,
  category TEXT NOT NULL,
  price_range TEXT NOT NULL DEFAULT '',
  opening_hours TEXT NOT NULL DEFAULT '11:00 AM – 11:00 PM',
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city_active
  ON public.restaurants (city, is_approved, is_active, is_demo);

DROP TRIGGER IF EXISTS trg_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER trg_restaurants_updated_at BEFORE UPDATE ON public.restaurants
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Reservations & Food Pre-Orders Tables (Enforcing Authenticated Customer Bookings)
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_ref TEXT NOT NULL UNIQUE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count >= 1),
  booking_tier TEXT NOT NULL DEFAULT 'Basic' CHECK (booking_tier IN ('Basic', 'Premium')),
  fee_per_guest NUMERIC(10, 2) NOT NULL DEFAULT 19 CHECK (fee_per_guest >= 0),
  platform_fee_total NUMERIC(10, 2) NOT NULL DEFAULT 19 CHECK (platform_fee_total >= 0),
  special_request TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Accepted', 'Confirmed', 'Completed', 'Cancelled', 'Rejected')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_reservations_updated_at ON public.reservations;
CREATE TRIGGER trg_reservations_updated_at BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.food_pre_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preorder_ref TEXT NOT NULL UNIQUE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  dining_date DATE NOT NULL,
  dining_time TEXT NOT NULL,
  package_name TEXT NOT NULL,
  plate_count INTEGER NOT NULL CHECK (plate_count >= 1),
  price_per_plate NUMERIC(10, 2) NOT NULL CHECK (price_per_plate > 0),
  total_food_amount NUMERIC(12, 2) GENERATED ALWAYS AS (plate_count * price_per_plate) STORED,
  advance_percent NUMERIC(5, 2) NOT NULL DEFAULT 50 CHECK (advance_percent >= 10 AND advance_percent <= 100),
  advance_amount NUMERIC(12, 2) NOT NULL CHECK (advance_amount >= 0),
  advance_paid BOOLEAN NOT NULL DEFAULT FALSE,
  food_preference TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Accepted', 'Advance Paid', 'Preparing', 'Ready', 'Completed', 'Rejected')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_food_pre_orders_updated_at ON public.food_pre_orders;
CREATE TRIGGER trg_food_pre_orders_updated_at BEFORE UPDATE ON public.food_pre_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security & Enforce Mandatory Login Before Booking
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_pre_orders ENABLE ROW LEVEL SECURITY;

-- Cities: public reads active cities; admin manages all cities
DROP POLICY IF EXISTS "Public reads active cities" ON public.cities;
CREATE POLICY "Public reads active cities"
  ON public.cities FOR SELECT
  USING (is_active = TRUE OR public.is_platform_admin());

DROP POLICY IF EXISTS "Admins manage cities" ON public.cities;
CREATE POLICY "Admins manage cities"
  ON public.cities FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

-- Restaurants: public reads ONLY approved & active listings; owners manage own; admins manage demo & approvals
DROP POLICY IF EXISTS "Public reads approved active restaurants" ON public.restaurants;
CREATE POLICY "Public reads approved active restaurants"
  ON public.restaurants FOR SELECT
  USING (
    (is_approved = TRUE AND is_active = TRUE)
    OR auth.uid() = owner_user_id
    OR public.is_platform_admin()
  );

DROP POLICY IF EXISTS "Owners and admins insert restaurants" ON public.restaurants;
CREATE POLICY "Owners and admins insert restaurants"
  ON public.restaurants FOR INSERT
  WITH CHECK (
    public.is_platform_admin()
    OR (auth.uid() IS NOT NULL AND auth.uid() = owner_user_id AND is_demo = FALSE)
  );

DROP POLICY IF EXISTS "Owners manage own restaurants and admins manage all" ON public.restaurants;
CREATE POLICY "Owners manage own restaurants and admins manage all"
  ON public.restaurants FOR UPDATE
  USING (auth.uid() = owner_user_id OR public.is_platform_admin())
  WITH CHECK (auth.uid() = owner_user_id OR public.is_platform_admin());

DROP POLICY IF EXISTS "Admins delete demo or flagged restaurants" ON public.restaurants;
CREATE POLICY "Admins delete demo or flagged restaurants"
  ON public.restaurants FOR DELETE
  USING (public.is_platform_admin());

-- Reservations: authenticated customers only (auth.uid() IS NOT NULL AND auth.uid() = customer_id)
DROP POLICY IF EXISTS "Authorized parties read reservations" ON public.reservations;
CREATE POLICY "Authorized parties read reservations"
  ON public.reservations FOR SELECT
  USING (
    auth.uid() = customer_id
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated customers create reservations" ON public.reservations;
CREATE POLICY "Authenticated customers create reservations"
  ON public.reservations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers and owners update reservations" ON public.reservations;
CREATE POLICY "Customers and owners update reservations"
  ON public.reservations FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

-- Food Pre-Orders: authenticated customers only
DROP POLICY IF EXISTS "Authorized parties read food pre-orders" ON public.food_pre_orders;
CREATE POLICY "Authorized parties read food pre-orders"
  ON public.food_pre_orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated customers create food pre-orders" ON public.food_pre_orders;
CREATE POLICY "Authenticated customers create food pre-orders"
  ON public.food_pre_orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers and owners update food pre-orders" ON public.food_pre_orders;
CREATE POLICY "Customers and owners update food pre-orders"
  ON public.food_pre_orders FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

-- Harden celebration_bookings & celebration_payments INSERT to explicitly require authenticated user
DROP POLICY IF EXISTS "Customers insert own celebration bookings" ON public.celebration_bookings;
CREATE POLICY "Customers insert own celebration bookings"
  ON public.celebration_bookings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = customer_id);

-- 5. Decommission Custom Celebration Requests & Quotations (Preserve Historical Records, Block New Writes)
DROP POLICY IF EXISTS "Customers create custom celebration requests" ON public.custom_celebration_requests;
CREATE POLICY "Decommissioned custom celebration requests block inserts"
  ON public.custom_celebration_requests FOR INSERT
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS "Restaurant owners insert quotations for their requests" ON public.celebration_quotations;
CREATE POLICY "Decommissioned quotations block inserts"
  ON public.celebration_quotations FOR INSERT
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS "Customers insert celebration payment only when valid" ON public.celebration_payments;
CREATE POLICY "Customers insert ready-made celebration payment only"
  ON public.celebration_payments FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = customer_id
    AND booking_kind = 'Ready-Made Package'
    AND celebration_booking_id IS NOT NULL
  );

-- 6. Idempotent Seed: 12 Fictional Demo Restaurants Across Lucknow, Uttar Pradesh
-- Clearly labeled is_demo = TRUE; genuine Lucknow locality names only; no fabricated street numbers, phones, or fake reviews.
INSERT INTO public.restaurants (
  slug, restaurant_name, description, city, locality, address, cuisine, category, price_range, opening_hours, images, is_demo, is_approved, is_active
)
VALUES
  (
    'awadh-mahal-dastarkhwan',
    'Awadh Mahal Dastarkhwan',
    'Fictional sample fine-dining venue showcasing slow-cooked Awadhi and Mughlai dining experiences for Gomti Nagar table reservations and celebration previews.',
    'Lucknow',
    'Gomti Nagar',
    'Gomti Nagar, Lucknow, Uttar Pradesh',
    'Awadhi, Mughlai, North Indian',
    'Fine Dining',
    '₹1,900 for two',
    '12:30 PM – 11:30 PM',
    '["/src/assets/images/lucknow_awadhi_fine_dining_1795598944946.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'hazratganj-verandah-cafe',
    'Hazratganj Verandah Cafe & Kitchen',
    'Fictional sample artisan cafe and Italian kitchen previewing morning espresso service, brunch reservations, and dessert pre-orders in Hazratganj.',
    'Lucknow',
    'Hazratganj',
    'Hazratganj, Lucknow, Uttar Pradesh',
    'Cafe, Italian, Continental',
    'Cafe',
    '₹1,350 for two',
    '09:30 AM – 11:00 PM',
    '["/src/assets/images/lucknow_artisan_cafe_1795598946264.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'nawabs-courtyard-dining',
    'Nawab''s Courtyard Dining',
    'Fictional sample heritage dining room demonstrating arched courtyard seating, Mughlai tasting plates, and ready-made family celebration packages.',
    'Lucknow',
    'Vibhuti Khand',
    'Vibhuti Khand, Lucknow, Uttar Pradesh',
    'Mughlai, Awadhi, North Indian',
    'Fine Dining',
    '₹2,100 for two',
    '12:00 PM – 11:30 PM',
    '["/src/assets/images/lucknow_heritage_dining_1795597938002.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'gomti-skydeck-rooftop',
    'Gomti Skydeck Rooftop Lounge',
    'Fictional sample twilight rooftop venue built to demonstrate open-air table bookings, candlelight anniversary setups, and multi-cuisine menus.',
    'Lucknow',
    'Gomti Nagar Extension',
    'Gomti Nagar Extension, Lucknow, Uttar Pradesh',
    'Continental, North Indian, Italian',
    'Rooftop Dining',
    '₹1,750 for two',
    '05:00 PM – 12:00 AM',
    '["/src/assets/images/lucknow_rooftop_lounge_1795598945404.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'kebab-e-khas-heritage',
    'Kebab-e-Khas Heritage Kitchen',
    'Fictional sample traditional kitchen in Aminabad highlighting Awadhi kebabs, saffron biryanis, and seamless advance plate pre-orders.',
    'Lucknow',
    'Aminabad',
    'Aminabad, Lucknow, Uttar Pradesh',
    'Mughlai, Awadhi',
    'Heritage Dining',
    '₹1,100 for two',
    '12:00 PM – 11:00 PM',
    '["/src/assets/images/food_north_indian_1795416315472.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'chatori-chowk-rasoi',
    'Chatori Chowk Rasoi',
    'Fictional sample Old Lucknow family dining spot offering vegetarian North Indian thalis, Awadhi sweets, and group celebration tables.',
    'Lucknow',
    'Chowk',
    'Chowk, Lucknow, Uttar Pradesh',
    'Awadhi, North Indian, Desserts',
    'Family Restaurant',
    '₹950 for two',
    '11:00 AM – 10:30 PM',
    '["/src/assets/images/lucknow_family_dining_1795598945763.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'indira-garden-family-bistro',
    'Indira Garden Family Bistro',
    'Fictional sample multi-cuisine family restaurant designed for weekend lunches, birthday tables, and stress-free dining pre-orders.',
    'Lucknow',
    'Indira Nagar',
    'Indira Nagar, Lucknow, Uttar Pradesh',
    'Multi-cuisine, North Indian, South Indian',
    'Family Restaurant',
    '₹1,200 for two',
    '11:00 AM – 11:00 PM',
    '["/src/assets/images/lucknow_family_dining_1795598945763.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'aliganj-jade-bowl-wok',
    'Aliganj Jade Bowl & Wok',
    'Fictional sample pan-Asian & Chinese bistro demonstrating dim sum platters, group booth bookings, and private lounge celebrations.',
    'Lucknow',
    'Aliganj',
    'Aliganj, Lucknow, Uttar Pradesh',
    'Chinese, Continental',
    'Casual Dining',
    '₹1,300 for two',
    '12:00 PM – 11:00 PM',
    '["/src/assets/images/lucknow_asian_bistro_1795598946612.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'mahanagar-olive-hearth',
    'Mahanagar Olive & Hearth',
    'Fictional sample casual Italian eatery featuring wood-fired sourdough pairings and sunlit family dining previews.',
    'Lucknow',
    'Mahanagar',
    'Mahanagar, Lucknow, Uttar Pradesh',
    'Italian, Cafe',
    'Casual Dining',
    '₹1,450 for two',
    '11:30 AM – 11:00 PM',
    '["/src/assets/images/food_italian_continental_1795416315752.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'alambagh-courtyard-table',
    'Alambagh Courtyard Table',
    'Fictional sample neighbourhood family restaurant demonstrating multi-cuisine spreads, table reservations, and group party packages.',
    'Lucknow',
    'Alambagh',
    'Alambagh, Lucknow, Uttar Pradesh',
    'North Indian, Multi-cuisine, Chinese',
    'Family Restaurant',
    '₹1,050 for two',
    '11:00 AM – 10:30 PM',
    '["/src/assets/images/rest_heritage_courtyard_1795416316480.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'jankipuram-saffron-terrace',
    'Jankipuram Saffron Terrace',
    'Fictional sample rooftop dining room built to showcase evening North Indian & Awadhi dining and birthday packages in Jankipuram.',
    'Lucknow',
    'Jankipuram',
    'Jankipuram, Lucknow, Uttar Pradesh',
    'North Indian, Awadhi, Fast Food',
    'Rooftop Dining',
    '₹1,150 for two',
    '12:30 PM – 11:00 PM',
    '["/src/assets/images/hero_lucknow_dining_1795597936589.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  ),
  (
    'sushant-golf-pavilion',
    'Sushant Golf Pavilion & Patisserie',
    'Fictional sample patisserie and contemporary bistro previewing afternoon tea, artisan desserts, and couple-friendly dining in Sushant Golf City.',
    'Lucknow',
    'Sushant Golf City',
    'Sushant Golf City, Lucknow, Uttar Pradesh',
    'Cafe, Desserts, Continental',
    'Patisserie & Bistro',
    '₹1,600 for two',
    '10:00 AM – 11:00 PM',
    '["/src/assets/images/food_desserts_cafe_1795416315237.jpg"]'::jsonb,
    TRUE, TRUE, TRUE
  )
ON CONFLICT (slug) DO NOTHING;
