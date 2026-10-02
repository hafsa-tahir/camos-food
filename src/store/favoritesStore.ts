'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FoodItem } from '@/lib/types'

interface FavoritesState {
  items: FoodItem[]
  toggleFavorite: (item: FoodItem) => boolean
  isFavorite: (itemIdOrName: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFavorite: (item: FoodItem) => {
        const items = get().items
        const exists = items.some(
          (i) =>
            i.id === item.id ||
            (i.name && item.name && i.name.trim().toLowerCase() === item.name.trim().toLowerCase())
        )

        if (exists) {
          set({
            items: items.filter(
              (i) =>
                i.id !== item.id &&
                i.name?.trim().toLowerCase() !== item.name?.trim().toLowerCase()
            ),
          })
          return false
        } else {
          set({ items: [...items, item] })
          return true
        }
      },

      isFavorite: (itemIdOrName: string) => {
        if (!itemIdOrName) return false
        const target = itemIdOrName.trim().toLowerCase()
        return get().items.some(
          (i) =>
            i.id.trim().toLowerCase() === target ||
            (i.name && i.name.trim().toLowerCase() === target)
        )
      },

      clearFavorites: () => set({ items: [] }),
    }),
    { name: 'camos-favorites-v2' }
  )
)
