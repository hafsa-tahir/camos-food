-- ============================================================
-- FoodApp - Add weekly_subscriptions Table (Zero DROP keywords)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create weekly_subscriptions table
CREATE TABLE IF NOT EXISTS weekly_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  package_plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
  start_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_weekly_subscriptions_status ON weekly_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_weekly_subscriptions_email ON weekly_subscriptions(email);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE weekly_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Updated_at Trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'weekly_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER weekly_subscriptions_updated_at BEFORE UPDATE ON weekly_subscriptions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- 5. Safe RLS Policy (checks existence instead of using DROP)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weekly_subscriptions' AND policyname = 'weekly_subscriptions_all'
  ) THEN
    CREATE POLICY "weekly_subscriptions_all" ON weekly_subscriptions FOR ALL USING (TRUE);
  END IF;
END $$;

-- 6. Reload schema cache
NOTIFY pgrst, 'reload schema';
