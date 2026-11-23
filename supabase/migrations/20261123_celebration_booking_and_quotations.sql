-- DineRestro – Celebration Booking & Custom Quotation System (Schema + RLS Reference)
-- Supports Two Separate Flows:
--   1. Ready-Made Celebration Packages (Direct Booking Without Quotation)
--   2. Custom Celebration Requests (Quotation Compulsory Before Advance Payment)
-- Business Rule: Decoration Charge is ALWAYS ₹0 ("Decoration Included – No Additional Charges").

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 1. celebration_packages
CREATE TABLE IF NOT EXISTS public.celebration_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  occasion_category TEXT NOT NULL CHECK (
    occasion_category IN (
      'Birthday',
      'Anniversary',
      'Candlelight Dinner',
      'Romantic Dinner',
      'Marriage Proposal',
      'Family Celebration',
      'Private Party',
      'Custom Celebration'
    )
  ),
  description TEXT NOT NULL,
  decoration_details TEXT NOT NULL,
  decoration_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (decoration_charge = 0),
  price_per_plate NUMERIC(10, 2) NOT NULL CHECK (price_per_plate > 0),
  min_plates INTEGER NOT NULL CHECK (min_plates >= 1),
  max_plates INTEGER NOT NULL CHECK (max_plates >= min_plates),
  dietary_type TEXT NOT NULL CHECK (dietary_type IN ('Veg', 'Non-Veg', 'Veg & Non-Veg')),
  plate_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  advance_percent NUMERIC(5, 2) NOT NULL DEFAULT 50 CHECK (advance_percent >= 10 AND advance_percent <= 100),
  special_instructions TEXT DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  approval_status TEXT NOT NULL DEFAULT 'Pending Approval' CHECK (
    approval_status IN ('Pending Approval', 'Approved', 'Rejected')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. celebration_package_images
CREATE TABLE IF NOT EXISTS public.celebration_package_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES public.celebration_packages(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. celebration_bookings (Ready-Made Packages — Direct Booking, NO Quotation Required)
CREATE TABLE IF NOT EXISTS public.celebration_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT NOT NULL UNIQUE,
  package_id UUID NOT NULL REFERENCES public.celebration_packages(id) ON DELETE RESTRICT,
  restaurant_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  plates_count INTEGER NOT NULL CHECK (plates_count >= 1),
  price_per_plate NUMERIC(10, 2) NOT NULL CHECK (price_per_plate > 0),
  decoration_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (decoration_charge = 0),
  total_package_amount NUMERIC(12, 2) GENERATED ALWAYS AS (plates_count * price_per_plate) STORED,
  advance_percent NUMERIC(5, 2) NOT NULL DEFAULT 50 CHECK (advance_percent >= 10 AND advance_percent <= 100),
  advance_amount NUMERIC(12, 2) NOT NULL CHECK (advance_amount >= 0),
  remaining_amount NUMERIC(12, 2) NOT NULL CHECK (remaining_amount >= 0),
  food_preference TEXT DEFAULT '',
  special_requests TEXT DEFAULT '',
  advance_paid BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Advance Pending' CHECK (
    status IN (
      'Pending',
      'Accepted',
      'Advance Pending',
      'Advance Paid',
      'Confirmed',
      'Completed',
      'Cancelled',
      'Rejected'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. custom_celebration_requests (Quotation Compulsory Flow)
CREATE TABLE IF NOT EXISTS public.custom_celebration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_ref TEXT NOT NULL UNIQUE,
  restaurant_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  occasion_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  guests_count INTEGER NOT NULL CHECK (guests_count >= 2),
  approximate_budget NUMERIC(12, 2) NOT NULL CHECK (approximate_budget >= 500),
  decoration_theme TEXT NOT NULL,
  preferred_colors TEXT NOT NULL,
  cake_requirements TEXT DEFAULT '',
  food_preferences TEXT NOT NULL,
  veg_nonveg_preference TEXT NOT NULL DEFAULT 'Pure Veg' CHECK (
    veg_nonveg_preference IN ('Pure Veg', 'Veg & Non-Veg', 'Non-Veg', 'Jain Options Available')
  ),
  decoration_requirements TEXT DEFAULT '',
  special_instructions TEXT DEFAULT '',
  reference_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  decoration_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (decoration_charge = 0),
  advance_paid BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'Request Received' CHECK (
    status IN (
      'Request Received',
      'Under Review',
      'Quotation Sent',
      'Quotation Accepted',
      'Quotation Rejected',
      'Advance Pending',
      'Advance Paid',
      'Confirmed',
      'Completed',
      'Cancelled'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. celebration_quotations (Strictly tied to Custom Requests, Locked on Acceptance)
CREATE TABLE IF NOT EXISTS public.celebration_quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE REFERENCES public.custom_celebration_requests(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  food_package_details TEXT NOT NULL,
  price_per_plate NUMERIC(10, 2) NOT NULL CHECK (price_per_plate >= 0),
  plates_count INTEGER NOT NULL CHECK (plates_count >= 1),
  cake_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cake_charge >= 0),
  special_services_notes TEXT DEFAULT '',
  decoration_details TEXT NOT NULL,
  decoration_charge NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (decoration_charge = 0),
  additional_included_services TEXT DEFAULT '',
  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  advance_percent NUMERIC(5, 2) NOT NULL DEFAULT 50 CHECK (advance_percent >= 10 AND advance_percent <= 100),
  advance_amount NUMERIC(12, 2) NOT NULL CHECK (advance_amount >= 0),
  remaining_amount NUMERIC(12, 2) NOT NULL CHECK (remaining_amount >= 0),
  valid_until DATE NOT NULL,
  terms_and_conditions TEXT NOT NULL,
  additional_notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Sent' CHECK (status IN ('Draft', 'Sent', 'Accepted', 'Rejected')),
  locked_after_acceptance BOOLEAN NOT NULL DEFAULT FALSE,
  rejection_reason TEXT DEFAULT '',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. celebration_quotation_items
CREATE TABLE IF NOT EXISTS public.celebration_quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.celebration_quotations(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Food', 'Cake', 'Service', 'Other')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. celebration_payments
CREATE TABLE IF NOT EXISTS public.celebration_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL UNIQUE,
  booking_kind TEXT NOT NULL CHECK (booking_kind IN ('Ready-Made Package', 'Custom Request Quotation')),
  celebration_booking_id UUID REFERENCES public.celebration_bookings(id) ON DELETE CASCADE,
  custom_request_id UUID REFERENCES public.custom_celebration_requests(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES public.celebration_quotations(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('PENDING', 'PAID', 'REFUNDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_booking_or_request_payment CHECK (
    (booking_kind = 'Ready-Made Package' AND celebration_booking_id IS NOT NULL AND custom_request_id IS NULL AND quotation_id IS NULL)
    OR
    (booking_kind = 'Custom Request Quotation' AND custom_request_id IS NOT NULL AND quotation_id IS NOT NULL AND celebration_booking_id IS NULL)
  )
);

-- Prevent editing locked quotations after customer acceptance
CREATE OR REPLACE FUNCTION public.prevent_locked_quotation_edits()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.locked_after_acceptance = TRUE AND (
    NEW.total_amount IS DISTINCT FROM OLD.total_amount OR
    NEW.price_per_plate IS DISTINCT FROM OLD.price_per_plate OR
    NEW.plates_count IS DISTINCT FROM OLD.plates_count OR
    NEW.cake_charge IS DISTINCT FROM OLD.cake_charge OR
    NEW.food_package_details IS DISTINCT FROM OLD.food_package_details OR
    NEW.advance_percent IS DISTINCT FROM OLD.advance_percent OR
    NEW.advance_amount IS DISTINCT FROM OLD.advance_amount
  ) THEN
    RAISE EXCEPTION 'Quotation is locked after customer acceptance and cannot be modified.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_locked_quotation_edits ON public.celebration_quotations;
CREATE TRIGGER trg_prevent_locked_quotation_edits
BEFORE UPDATE ON public.celebration_quotations
FOR EACH ROW EXECUTE FUNCTION public.prevent_locked_quotation_edits();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_cel_packages_updated_at ON public.celebration_packages;
CREATE TRIGGER trg_cel_packages_updated_at BEFORE UPDATE ON public.celebration_packages
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_cel_bookings_updated_at ON public.celebration_bookings;
CREATE TRIGGER trg_cel_bookings_updated_at BEFORE UPDATE ON public.celebration_bookings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_custom_requests_updated_at ON public.custom_celebration_requests;
CREATE TRIGGER trg_custom_requests_updated_at BEFORE UPDATE ON public.custom_celebration_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_cel_quotations_updated_at ON public.celebration_quotations;
CREATE TRIGGER trg_cel_quotations_updated_at BEFORE UPDATE ON public.celebration_quotations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security across all 7 celebration tables
ALTER TABLE public.celebration_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_package_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_celebration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celebration_payments ENABLE ROW LEVEL SECURITY;

-- RLS Helper note: auth.jwt()->>'role' or user profile table role check
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((auth.jwt()->'app_metadata'->>'role') = 'admin', FALSE);
$$;

-- Packages & Images Policies
CREATE POLICY "Public reads approved available packages"
  ON public.celebration_packages FOR SELECT
  USING (approval_status = 'Approved' AND is_available = TRUE);

CREATE POLICY "Owners manage their own celebration packages"
  ON public.celebration_packages FOR ALL
  USING (auth.uid() = owner_user_id OR public.is_platform_admin())
  WITH CHECK (auth.uid() = owner_user_id OR public.is_platform_admin());

CREATE POLICY "Public reads approved package images"
  ON public.celebration_package_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.celebration_packages p
      WHERE p.id = package_id
        AND ((p.approval_status = 'Approved' AND p.is_available = TRUE) OR p.owner_user_id = auth.uid() OR public.is_platform_admin())
    )
  );

CREATE POLICY "Owners manage own package images"
  ON public.celebration_package_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.celebration_packages p
      WHERE p.id = package_id AND (p.owner_user_id = auth.uid() OR public.is_platform_admin())
    )
  );

-- Ready-Made Celebration Bookings Policies
CREATE POLICY "Customers read and create own celebration bookings"
  ON public.celebration_bookings FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = owner_user_id OR public.is_platform_admin());

CREATE POLICY "Customers insert own celebration bookings"
  ON public.celebration_bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers cancel or owners update status on celebration bookings"
  ON public.celebration_bookings FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() = owner_user_id OR public.is_platform_admin())
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = owner_user_id OR public.is_platform_admin());

-- Custom Celebration Requests Policies
CREATE POLICY "Customer owner admin read custom requests"
  ON public.custom_celebration_requests FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = owner_user_id OR public.is_platform_admin());

CREATE POLICY "Customers create custom celebration requests"
  ON public.custom_celebration_requests FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers and restaurant owners update custom celebration requests"
  ON public.custom_celebration_requests FOR UPDATE
  USING (auth.uid() = customer_id OR auth.uid() = owner_user_id OR public.is_platform_admin())
  WITH CHECK (auth.uid() = customer_id OR auth.uid() = owner_user_id OR public.is_platform_admin());

-- Quotations Policies (Admin oversight is read-only; only restaurant owner creates; customer accepts/rejects)
CREATE POLICY "Customer owner admin read quotations"
  ON public.celebration_quotations FOR SELECT
  USING (auth.uid() = customer_id OR auth.uid() = owner_user_id OR public.is_platform_admin());

CREATE POLICY "Restaurant owners insert quotations for their requests"
  ON public.celebration_quotations FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Restaurant owners edit unlocked or customers accept/reject quotations"
  ON public.celebration_quotations FOR UPDATE
  USING (auth.uid() = owner_user_id OR auth.uid() = customer_id)
  WITH CHECK (
    (auth.uid() = owner_user_id AND locked_after_acceptance = FALSE)
    OR auth.uid() = customer_id
  );

CREATE POLICY "Read quotation items for authorized parties"
  ON public.celebration_quotation_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.celebration_quotations q
      WHERE q.id = quotation_id
        AND (q.customer_id = auth.uid() OR q.owner_user_id = auth.uid() OR public.is_platform_admin())
    )
  );

CREATE POLICY "Owners manage unlocked quotation items"
  ON public.celebration_quotation_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.celebration_quotations q
      WHERE q.id = quotation_id AND q.owner_user_id = auth.uid() AND q.locked_after_acceptance = FALSE
    )
  );

-- Celebration Payments Policies (Custom Request payments strictly require Accepted quotation)
CREATE POLICY "Read own or venue celebration payments"
  ON public.celebration_payments FOR SELECT
  USING (
    auth.uid() = customer_id
    OR public.is_platform_admin()
    OR EXISTS (
      SELECT 1 FROM public.celebration_bookings b WHERE b.id = celebration_booking_id AND b.owner_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.custom_celebration_requests r WHERE r.id = custom_request_id AND r.owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Customers insert celebration payment only when valid"
  ON public.celebration_payments FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id AND (
      booking_kind = 'Ready-Made Package'
      OR EXISTS (
        SELECT 1 FROM public.celebration_quotations q
        WHERE q.id = quotation_id
          AND q.request_id = custom_request_id
          AND q.status = 'Accepted'
          AND q.locked_after_acceptance = TRUE
      )
    )
  );
