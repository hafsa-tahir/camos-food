// ============================================================
// TypeScript Types for the FoodApp
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// ============================================================
// DATABASE TYPES
// ============================================================

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  account_credit: number
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface DietProfile {
  id: string
  customer_id: string
  weight_kg?: number
  height_cm?: number
  age?: number
  gender?: 'male' | 'female'
  activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal?: 'lose_weight' | 'maintain' | 'gain_weight'
  calorie_target?: number
  restrictions: string[]
  created_at: string
  updated_at: string
}

export interface FoodItem {
  id: string
  name: string
  description?: string
  price: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  tags: string[]
  image_url?: string
  category: string
  status: 'active' | 'pending' | 'rejected' | 'inactive'
  submitted_by?: string
  is_featured: boolean
  sort_order: number
  variants?: { name: string; price?: number }[]
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  title: string
  description?: string
  discount_type: 'percentage' | 'flat'
  discount_value: number
  applies_to: 'storewide' | 'item' | 'category'
  item_id?: string
  category?: string
  min_order_amount: number
  max_discount_amount?: number
  image_url?: string
  starts_at: string
  ends_at?: string
  is_active: boolean
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  owner_id: string
  friend_discount_percent: number
  owner_reward_amount: number
  max_uses: number
  times_used: number
  is_active: boolean
  created_at: string
}

export interface Order {
  id: string
  customer_id: string
  coupon_id?: string
  deal_id?: string
  subtotal: number
  discount_amount: number
  total: number
  status: 'pending' | 'paid' | 'preparing' | 'delivered' | 'cancelled'
  stripe_payment_intent_id?: string
  stripe_session_id?: string
  delivery_address?: string
  notes?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  food_item_id: string
  quantity: number
  price_at_order: number
  name_at_order: string
  calories_at_order: number
  created_at: string
}

export interface DailyMealLog {
  id: string
  customer_id: string
  food_item_id?: string
  custom_item_name?: string
  date: string
  meal_slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  quantity: number
  created_at: string
}

// ============================================================
// CART TYPES
// ============================================================

export interface CartItem {
  food_item: FoodItem
  quantity: number
}

export interface CartState {
  items: CartItem[]
  addItem: (item: FoodItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  totalCalories: () => number
  itemCount: () => number
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// ============================================================
// DIET CALCULATION TYPES
// ============================================================

export interface CalorieCalculationInput {
  weight_kg: number
  height_cm: number
  age: number
  gender: 'male' | 'female'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'lose_weight' | 'maintain' | 'gain_weight'
}

export interface MealPlanSlot {
  slot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  target_calories: number
  suggested_items: FoodItem[]
}

export const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose_weight: -500,
  maintain: 0,
  gain_weight: +300,
}

export const DIETARY_TAGS = [
  'halal',
  'vegan',
  'vegetarian',
  'gluten-free',
  'dairy-free',
  'keto',
  'low-calorie',
  'high-protein',
  'spicy',
  'healthy',
  'pakistani',
  'italian',
  'american',
  'middle-eastern',
  'breakfast',
  'dessert',
  'budget-friendly',
  'bestseller',
  'popular',
]

export const FOOD_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'main', label: 'Main Course' },
  { value: 'burger', label: 'Burgers' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'rice', label: 'Rice & Biryani' },
  { value: 'salad', label: 'Salads' },
  { value: 'bowl', label: 'Bowls' },
  { value: 'wrap', label: 'Wraps' },
  { value: 'tacos', label: 'Tacos' },
  { value: 'pasta', label: 'Pasta' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'snack', label: 'Snacks' },
  { value: 'dessert', label: 'Desserts' },
  { value: 'starter', label: 'Starters' },
]
