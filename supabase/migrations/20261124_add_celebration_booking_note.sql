-- DineRestro – Additive Migration: Celebration Booking Customer Note
-- Safely adds an optional customer_note column to public.celebration_bookings
-- without breaking or removing existing records or custom request/quotation tables.

ALTER TABLE public.celebration_bookings
  ADD COLUMN IF NOT EXISTS customer_note TEXT NOT NULL DEFAULT '';

ALTER TABLE public.celebration_bookings
  DROP CONSTRAINT IF EXISTS chk_celebration_bookings_customer_note_length;

ALTER TABLE public.celebration_bookings
  ADD CONSTRAINT chk_celebration_bookings_customer_note_length
  CHECK (char_length(customer_note) <= 500);

-- Safely backfill customer_note from existing special_requests for legacy rows
UPDATE public.celebration_bookings
SET customer_note = LEFT(COALESCE(special_requests, ''), 500)
WHERE customer_note = '' AND COALESCE(special_requests, '') <> '';

COMMENT ON COLUMN public.celebration_bookings.customer_note IS
  'Optional special instructions note shared by the customer with the restaurant (max 500 chars). Subject to restaurant confirmation; does not automatically confirm additional services or included items.';
