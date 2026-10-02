import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CalorieCalculationInput, ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS } from './types'

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================================
// DIET CALCULATION — Mifflin-St Jeor BMR
// ============================================================

export function calculateDailyCalories(input: CalorieCalculationInput): number {
  const { weight_kg, height_cm, age, gender, activity_level, goal } = input

  // Mifflin-St Jeor BMR
  let bmr: number
  if (gender === 'male') {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
  } else {
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level]
  const targetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[goal])

  // Ensure minimum of 1200 kcal
  return Math.max(1200, targetCalories)
}

// ============================================================
// COUPON CODE GENERATOR
// ============================================================

export function generateCouponCode(_name?: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let randomStr = ''
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `CAMO-${randomStr}`
}

// ============================================================
// DISCOUNT CALCULATOR
// ============================================================

export function calculateDiscount(
  subtotal: number,
  discountType: 'percentage' | 'flat',
  discountValue: number,
  maxDiscount?: number
): number {
  let discount = 0
  if (discountType === 'percentage') {
    discount = (subtotal * discountValue) / 100
    if (maxDiscount) discount = Math.min(discount, maxDiscount)
  } else {
    discount = discountValue
  }
  return Math.min(discount, subtotal)
}

// ============================================================
// MEAL SLOT CALORIE DISTRIBUTION
// ============================================================

export function getMealSlotTargets(dailyCalories: number) {
  return {
    breakfast: Math.round(dailyCalories * 0.25),
    lunch: Math.round(dailyCalories * 0.35),
    dinner: Math.round(dailyCalories * 0.30),
    snack: Math.round(dailyCalories * 0.10),
  }
}

// ============================================================
// STATUS HELPERS
// ============================================================

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-blue-100 text-blue-700',
    preparing: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Payment Confirmed',
    preparing: 'Being Prepared',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}

// ============================================================
// CALORIE PROGRESS
// ============================================================

export function getCalorieProgressColor(consumed: number, target: number): string {
  const percent = (consumed / target) * 100
  if (percent < 70) return '#848D5D'
  if (percent < 90) return '#A0A873'
  if (percent <= 100) return '#6B7349'
  return '#EF4444'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}
