import type { Metadata } from 'next'
import { REAL_MENU_ITEMS, enrichFoodItem } from '@/lib/menuData'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const rawItem = REAL_MENU_ITEMS.find((i) => i.id === id || i.name.toLowerCase() === id.toLowerCase())
  const item = rawItem ? enrichFoodItem(rawItem) : null

  if (!item) {
    return {
      title: 'Dish Details',
      description: 'Order delicious authentic halal food from Camo\'s Foods.',
    }
  }

  const title = `${item.name} (PKR ${item.price})`
  const description = `${item.description} Nutritional info: ${item.calories} kcal, ${item.protein_g}g protein. Order fresh from Camo's Foods.`

  return {
    title,
    description,
    alternates: {
      canonical: `/menu/${item.id}`,
    },
    openGraph: {
      title: `${item.name} | Camo's Foods`,
      description,
      url: `https://www.camosfoods.com/menu/${item.id}`,
      images: [
        {
          url: item.image_url || '/hero-plate.jpg',
          alt: item.name,
        },
      ],
    },
  }
}

export default function DishLayout({ children }: { children: React.ReactNode }) {
  return children
}
