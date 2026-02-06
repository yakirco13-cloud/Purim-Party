-- Supabase SQL Setup for Purim Party RSVP
-- Run this in your Supabase SQL Editor

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  guest_count INTEGER DEFAULT 1,
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  qr_token TEXT UNIQUE NOT NULL,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_status ON guests(status);
CREATE INDEX IF NOT EXISTS idx_guests_qr_token ON guests(qr_token);

-- Enable Row Level Security
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for guest registration)
CREATE POLICY "Allow public insert" ON guests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Only authenticated users can read
CREATE POLICY "Allow authenticated read" ON guests
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users can update
CREATE POLICY "Allow authenticated update" ON guests
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Allow service role all" ON guests
  FOR ALL
  TO service_role
  USING (true);
