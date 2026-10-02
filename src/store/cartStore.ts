'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, CartState, FoodItem } from '@/lib/types'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (food_item: FoodItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.food_item.id === food_item.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.food_item.id === food_item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { food_item, quantity: 1 }] }
        })
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.food_item.id !== itemId),
        }))
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.food_item.id === itemId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () => {
        return get().items.reduce(
          (sum, item) => sum + item.food_item.price * item.quantity,
          0
        )
      },

      totalCalories: () => {
        return get().items.reduce(
          (sum, item) => sum + item.food_item.calories * item.quantity,
          0
        )
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    { name: 'foodapp-cart' }
  )
)
