-- ============================================================
-- FoodApp - Full Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  address TEXT,
  account_credit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DIET PROFILES TABLE
-- ============================================================
CREATE TABLE diet_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 1),
  height_cm NUMERIC(5, 1),
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female')),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  goal TEXT CHECK (goal IN ('lose_weight', 'maintain', 'gain_weight')),
  calorie_target INTEGER,
  restrictions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- ============================================================
-- FOOD ITEMS TABLE
-- ============================================================
CREATE TABLE food_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC(6, 1) DEFAULT 0,
  carbs_g NUMERIC(6, 1) DEFAULT 0,
  fat_g NUMERIC(6, 1) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  category TEXT DEFAULT 'main',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected', 'inactive')),
  submitted_by UUID REFERENCES customers(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEALS TABLE
-- ============================================================
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10, 2) NOT NULL,
  applies_to TEXT NOT NULL DEFAULT 'storewide' CHECK (applies_to IN ('storewide', 'item', 'category')),
  item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
  category TEXT,
  min_order_amount NUMERIC(10, 2) DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  image_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COUPONS TABLE
-- ============================================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  friend_discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 10,
  owner_reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 200,
  max_uses INTEGER NOT NULL DEFAULT 10,
  times_used INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'delivered', 'cancelled')),
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_order NUMERIC(10, 2) NOT NULL,
  name_at_order TEXT NOT NULL,
  calories_at_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DAILY MEAL LOGS TABLE
-- ============================================================
CREATE TABLE daily_meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES food_items(id) ON DELETE SET NULL,
  custom_item_name TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'dinner', 'snack')),
  calories INTEGER NOT NULL DEFAULT 0,
  protein_g NUMERIC(6, 1) DEFAULT 0,
  carbs_g NUMERIC(6, 1) DEFAULT 0,
  fat_g NUMERIC(6, 1) DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_food_items_status ON food_items(status);
CREATE INDEX idx_food_items_tags ON food_items USING GIN(tags);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_meal_logs_customer_date ON daily_meal_logs(customer_id, date);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_deals_active ON deals(is_active, starts_at, ends_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_meal_logs ENABLE ROW LEVEL SECURITY;

-- Customers: own row only
CREATE POLICY "customers_own" ON customers
  FOR ALL USING (auth.uid() = id);

-- Diet profiles: own profile only
CREATE POLICY "diet_profiles_own" ON diet_profiles
  FOR ALL USING (auth.uid() = customer_id);

-- Food items: anyone can read active items; customers can insert pending; service role does rest
CREATE POLICY "food_items_read_active" ON food_items
  FOR SELECT USING (status = 'active' OR auth.uid() = submitted_by);

CREATE POLICY "food_items_customer_suggest" ON food_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND status = 'pending');

-- Deals: anyone can read active deals
CREATE POLICY "deals_read_active" ON deals
  FOR SELECT USING (is_active = TRUE AND (ends_at IS NULL OR ends_at > NOW()));

-- Coupons: own coupons
CREATE POLICY "coupons_own" ON coupons
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "coupons_insert_own" ON coupons
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Orders: own orders
CREATE POLICY "orders_own" ON orders
  FOR ALL USING (auth.uid() = customer_id);

-- Order items: own orders' items
CREATE POLICY "order_items_own" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

-- Meal logs: own logs
CREATE POLICY "meal_logs_own" ON daily_meal_logs
  FOR ALL USING (auth.uid() = customer_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER diet_profiles_updated_at BEFORE UPDATE ON diet_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER food_items_updated_at BEFORE UPDATE ON food_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Sample Food Items
INSERT INTO food_items (name, description, price, calories, protein_g, carbs_g, fat_g, tags, category, is_featured, sort_order, image_url) VALUES
('Grilled Chicken Salad', 'Fresh greens with grilled chicken breast, cherry tomatoes, cucumber, and our signature herb dressing', 550, 320, 35, 18, 12, ARRAY['healthy','high-protein','halal','gluten-free'], 'salad', TRUE, 1, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500'),
('Beef Burger Deluxe', 'Juicy beef patty with cheddar cheese, caramelized onions, lettuce, and special sauce in a brioche bun', 890, 650, 38, 55, 32, ARRAY['halal','bestseller'], 'burger', TRUE, 2, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500'),
('Veggie Buddha Bowl', 'Roasted sweet potato, chickpeas, avocado, quinoa, and tahini drizzle', 480, 420, 14, 62, 16, ARRAY['vegan','vegetarian','healthy','gluten-free'], 'bowl', TRUE, 3, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500'),
('Chicken Biryani', 'Aromatic basmati rice cooked with tender chicken and whole spices. Served with raita', 750, 580, 32, 72, 18, ARRAY['halal','spicy','pakistani'], 'rice', TRUE, 4, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'),
('Margherita Pizza', 'Classic thin-crust pizza with San Marzano tomato sauce, fresh mozzarella, and basil', 950, 720, 28, 88, 24, ARRAY['vegetarian','bestseller'], 'pizza', TRUE, 5, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500'),
('Salmon Poke Bowl', 'Fresh salmon, edamame, mango, cucumber, and sushi rice with sesame-ginger dressing', 1100, 510, 38, 58, 14, ARRAY['healthy','high-protein','pescatarian','gluten-free'], 'bowl', FALSE, 6, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500'),
('Chicken Shawarma Wrap', 'Marinated chicken, garlic sauce, pickles, and fresh vegetables in a soft pita wrap', 420, 480, 30, 48, 16, ARRAY['halal','popular','middle-eastern'], 'wrap', TRUE, 7, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500'),
('Classic Cheeseburger', 'American beef patty with classic cheese, mustard, ketchup, and pickles', 750, 550, 30, 42, 28, ARRAY['halal','bestseller'], 'burger', FALSE, 8, 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=500'),
('Pasta Alfredo', 'Fettuccine in creamy Alfredo sauce with parmesan and black pepper', 680, 680, 22, 78, 28, ARRAY['vegetarian','italian'], 'pasta', FALSE, 9, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500'),
('Chicken Caesar Wrap', 'Grilled chicken, romaine, parmesan, and Caesar dressing in a whole wheat wrap', 490, 420, 32, 38, 14, ARRAY['halal','healthy'], 'wrap', FALSE, 10, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500'),
('Dal Chawal', 'Comfort food lentil curry with steamed basmati rice, tempered with cumin and ghee', 280, 440, 16, 68, 10, ARRAY['vegetarian','halal','pakistani','budget-friendly'], 'rice', FALSE, 11, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500'),
('Avocado Toast', 'Sourdough toast with smashed avocado, cherry tomatoes, microgreens, and poached eggs', 420, 380, 16, 32, 22, ARRAY['vegetarian','healthy','breakfast'], 'breakfast', FALSE, 12, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=500'),
('Mango Smoothie Bowl', 'Blended mango and banana topped with granola, fresh fruits, and chia seeds', 350, 310, 8, 62, 6, ARRAY['vegan','healthy','breakfast','gluten-free'], 'breakfast', FALSE, 13, 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=500'),
('Chicken Quesadilla', 'Flour tortilla filled with seasoned chicken, mixed cheese, and peppers', 560, 530, 34, 42, 22, ARRAY['halal','popular'], 'snack', FALSE, 14, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500'),
('Fresh Fruit Salad', 'Seasonal fruits with honey-lime dressing and fresh mint', 220, 180, 3, 44, 1, ARRAY['vegan','healthy','gluten-free','low-calorie'], 'dessert', FALSE, 15, 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500'),
('Chocolate Brownie', 'Rich, fudgy dark chocolate brownie with a crinkly top', 180, 380, 5, 48, 18, ARRAY['vegetarian','dessert'], 'dessert', FALSE, 16, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500'),
('Nihari', 'Slow-cooked beef stew with aromatic spices, served with naan', 850, 620, 40, 38, 32, ARRAY['halal','pakistani','spicy','popular'], 'main', TRUE, 17, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500'),
('Paneer Tikka', 'Marinated cottage cheese cubes grilled in tandoor with bell peppers and onions', 580, 380, 24, 28, 18, ARRAY['vegetarian','high-protein','indian'], 'starter', FALSE, 18, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500'),
('Greek Salad', 'Crisp cucumbers, tomatoes, olives, feta cheese with oregano and olive oil', 320, 240, 10, 18, 16, ARRAY['vegetarian','healthy','gluten-free','low-calorie'], 'salad', FALSE, 19, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500'),
('Egg Fried Rice', 'Wok-fried basmati rice with scrambled eggs, spring onions, soy sauce, and vegetables', 380, 460, 16, 72, 10, ARRAY['vegetarian','popular','budget-friendly'], 'rice', FALSE, 20, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500');

-- Sample Deals
INSERT INTO deals (title, description, discount_type, discount_value, applies_to, min_order_amount, image_url, starts_at, ends_at) VALUES
('Weekend Special', 'Get 20% off on all orders above PKR 800 this weekend!', 'percentage', 20, 'storewide', 800, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500', NOW(), NOW() + INTERVAL '7 days'),
('Healthy Choices', 'Flat PKR 100 off on all salads and bowls', 'flat', 100, 'category', 0, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', NOW(), NOW() + INTERVAL '30 days'),
('First Order Discount', '15% off your first order — welcome to FoodApp!', 'percentage', 15, 'storewide', 0, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500', NOW(), NOW() + INTERVAL '90 days');
