-- Add this function to your Supabase SQL Editor after running 001_initial_schema.sql
-- This enables crediting referrers via a secure RPC call

CREATE OR REPLACE FUNCTION increment_credit(customer_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE customers
  SET account_credit = account_credit + amount
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
