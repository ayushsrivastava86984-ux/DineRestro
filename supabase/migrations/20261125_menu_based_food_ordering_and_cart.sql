-- DineRestro – Menu-Based Food Ordering, Structured Menu Items, Cart Checkout & Order Snapshots
-- Additive migration: preserves existing menu gallery (menuPhotos), plate packages, reservations, and celebrations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Extend restaurants with configurable food pre-order advance percentage (if not already present)
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS pre_order_advance_percent INTEGER NOT NULL DEFAULT 50
  CHECK (pre_order_advance_percent >= 10 AND pre_order_advance_percent <= 100);

-- 2. Structured Menu Categories Table
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (
    name IN (
      'Starters',
      'Main Course',
      'Biryani and Rice',
      'Breads',
      'Snacks',
      'Desserts',
      'Beverages',
      'Combos'
    )
  ),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant
  ON public.menu_categories (restaurant_id, sort_order);

DROP TRIGGER IF EXISTS trg_menu_categories_updated_at ON public.menu_categories;
CREATE TRIGGER trg_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Structured Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL CHECK (
    category_name IN (
      'Starters',
      'Main Course',
      'Biryani and Rice',
      'Breads',
      'Snacks',
      'Desserts',
      'Beverages',
      'Combos'
    )
  ),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_inr NUMERIC(10, 2) NOT NULL CHECK (price_inr > 0),
  dietary_type TEXT NOT NULL DEFAULT 'Veg' CHECK (dietary_type IN ('Veg', 'Non-Veg')),
  image_url TEXT NOT NULL DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_recommended BOOLEAN NOT NULL DEFAULT FALSE,
  prep_time_minutes INTEGER CHECK (prep_time_minutes IS NULL OR prep_time_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available
  ON public.menu_items (restaurant_id, category_name, is_available);

DROP TRIGGER IF EXISTS trg_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER trg_menu_items_updated_at BEFORE UPDATE ON public.menu_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Cart-Based Food Orders Table (Zero table-platform fee; honours per-restaurant advance % or Order at Restaurant)
CREATE TABLE IF NOT EXISTS public.food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT NOT NULL UNIQUE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  dining_date DATE NOT NULL,
  dining_time TEXT NOT NULL,
  order_mode TEXT NOT NULL DEFAULT 'Pre-Order Advance' CHECK (
    order_mode IN ('Pre-Order Advance', 'Order at Restaurant')
  ),
  special_instructions TEXT NOT NULL DEFAULT '',
  subtotal_amount NUMERIC(12, 2) NOT NULL CHECK (subtotal_amount >= 0),
  additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (additional_charges >= 0),
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  advance_percent INTEGER NOT NULL DEFAULT 50 CHECK (advance_percent >= 0 AND advance_percent <= 100),
  advance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (advance_amount >= 0),
  remaining_amount NUMERIC(12, 2) NOT NULL CHECK (remaining_amount >= 0),
  advance_paid BOOLEAN NOT NULL DEFAULT FALSE,
  payment_status TEXT NOT NULL DEFAULT 'Unpaid' CHECK (
    payment_status IN ('Unpaid', 'Advance Paid', 'Pay at Restaurant')
  ),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (
    status IN ('Pending', 'Accepted', 'Rejected', 'Advance Paid', 'Preparing', 'Ready', 'Completed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_orders_customer_restaurant
  ON public.food_orders (customer_id, restaurant_id, created_at DESC);

DROP TRIGGER IF EXISTS trg_food_orders_updated_at ON public.food_orders;
CREATE TRIGGER trg_food_orders_updated_at BEFORE UPDATE ON public.food_orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Food Order Items Snapshot Table (Preserves item name, price & metadata at order time)
CREATE TABLE IF NOT EXISTS public.food_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_order_id UUID NOT NULL REFERENCES public.food_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE RESTRICT,
  item_name_snapshot TEXT NOT NULL,
  item_description_snapshot TEXT NOT NULL DEFAULT '',
  category_name_snapshot TEXT NOT NULL,
  dietary_type_snapshot TEXT NOT NULL CHECK (dietary_type_snapshot IN ('Veg', 'Non-Veg')),
  image_url_snapshot TEXT NOT NULL DEFAULT '',
  unit_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (unit_price_snapshot > 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  line_subtotal NUMERIC(12, 2) GENERATED ALWAYS AS (unit_price_snapshot * quantity) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_order_items_order
  ON public.food_order_items (food_order_id);

-- 6. Enable Row Level Security
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_order_items ENABLE ROW LEVEL SECURITY;

-- menu_categories policies
DROP POLICY IF EXISTS "Public reads active menu categories for approved restaurants" ON public.menu_categories;
CREATE POLICY "Public reads active menu categories for approved restaurants"
  ON public.menu_categories FOR SELECT
  USING (
    (
      is_active = TRUE
      AND EXISTS (
        SELECT 1 FROM public.restaurants r
        WHERE r.id = restaurant_id AND r.is_approved = TRUE AND r.is_active = TRUE
      )
    )
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners manage own menu categories" ON public.menu_categories;
CREATE POLICY "Owners manage own menu categories"
  ON public.menu_categories FOR ALL
  USING (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

-- menu_items policies
DROP POLICY IF EXISTS "Public reads menu items for approved restaurants" ON public.menu_items;
CREATE POLICY "Public reads menu items for approved restaurants"
  ON public.menu_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.is_approved = TRUE AND r.is_active = TRUE
    )
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners manage own menu items" ON public.menu_items;
CREATE POLICY "Owners manage own menu items"
  ON public.menu_items FOR ALL
  USING (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

-- food_orders policies
DROP POLICY IF EXISTS "Authorized parties read food orders" ON public.food_orders;
CREATE POLICY "Authorized parties read food orders"
  ON public.food_orders FOR SELECT
  USING (
    auth.uid() = customer_id
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated customers create food orders for approved restaurants" ON public.food_orders;
CREATE POLICY "Authenticated customers create food orders for approved restaurants"
  ON public.food_orders FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.is_approved = TRUE AND r.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "Owners and customers update food orders" ON public.food_orders;
CREATE POLICY "Owners and customers update food orders"
  ON public.food_orders FOR UPDATE
  USING (
    auth.uid() = customer_id
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

-- food_order_items policies (Enforce customer ownership + approved restaurant + available menu item)
DROP POLICY IF EXISTS "Authorized parties read food order items" ON public.food_order_items;
CREATE POLICY "Authorized parties read food order items"
  ON public.food_order_items FOR SELECT
  USING (
    public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.food_orders fo
      WHERE fo.id = food_order_id AND fo.customer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = restaurant_id AND r.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated customers insert available approved food order items" ON public.food_order_items;
CREATE POLICY "Authenticated customers insert available approved food order items"
  ON public.food_order_items FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.food_orders fo
      JOIN public.restaurants r ON r.id = fo.restaurant_id
      WHERE fo.id = food_order_id
        AND fo.customer_id = auth.uid()
        AND fo.restaurant_id = food_order_items.restaurant_id
        AND r.is_approved = TRUE
        AND r.is_active = TRUE
    )
    AND EXISTS (
      SELECT 1
      FROM public.menu_items mi
      WHERE mi.id = menu_item_id
        AND mi.restaurant_id = food_order_items.restaurant_id
        AND mi.is_available = TRUE
    )
  );
