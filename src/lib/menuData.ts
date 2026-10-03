import { FoodItem } from './types'

export const REAL_MENU_ITEMS: FoodItem[] = [
  {
    id: 'camos-chicken-pulao',
    name: 'Chicken Pulao',
    description: 'Aromatic basmati rice cooked with succulent bone-in chicken leg pieces, fragrant whole garam masala, and caramelized onions. Served with fresh mint raita & salad.',
    price: 550,
    calories: 620,
    protein_g: 38,
    carbs_g: 74,
    fat_g: 18,
    category: 'rice',
    tags: ['Rich Flavors', 'Homemade Goodness', 'halal', 'bestseller', 'high-protein', 'pakistani'],
    image_url: '/items/chicken-pulao.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-chicken-chilli-dry',
    name: 'Chicken Chilli Dry with Rice',
    description: 'Crispy wok-tossed boneless chicken bites glazed in a spicy savory chilli-garlic sauce with bell peppers, green chillies, and scallions, paired with fragrant steamed rice.',
    price: 650,
    calories: 580,
    protein_g: 44,
    carbs_g: 66,
    fat_g: 14,
    category: 'bowl',
    tags: ['Spicy & Savory', "Chef's Special", 'High Protein', 'halal', 'popular'],
    image_url: '/items/chicken-chilli-dry.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-creamy-chicken-pasta',
    name: 'Creamy Chicken Pasta',
    description: 'Al dente penne pasta tossed in a luxurious homemade garlic parmesan alfredo cream sauce, topped with seasoned grilled chicken strips and fresh parsley.',
    price: 650,
    calories: 690,
    protein_g: 36,
    carbs_g: 70,
    fat_g: 26,
    category: 'pasta',
    tags: ['Creamy Tasty', 'Always a Good Idea', 'Homemade Goodness', 'halal', 'italian', 'popular'],
    image_url: '/items/creamy-chicken-pasta.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-chicken-tacos',
    name: 'Chicken Tacos',
    description: 'Three soft flour tortillas loaded with tender grilled chicken, fresh lettuce, diced tomatoes, red onions, cilantro, and drizzled with our signature creamy sauce. Served with lime wedges.',
    price: 800,
    calories: 540,
    protein_g: 42,
    carbs_g: 48,
    fat_g: 16,
    category: 'tacos',
    tags: ['Fresh & Juicy', 'Flavourful', 'halal', 'high-protein', 'popular'],
    image_url: '/items/chicken-tacos.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-cheese-omelet',
    name: 'Cheese Omelet with Chai & Bread',
    description: 'Fluffy golden cheese omelet loaded with melted cheddar, garnished with fresh herbs. Served with two slices of crispy buttered toast and a hot cup of desi chai.',
    price: 450,
    calories: 420,
    protein_g: 24,
    carbs_g: 32,
    fat_g: 22,
    category: 'breakfast',
    tags: ['Fresh Breakfast', 'Good Vibes', 'Simple Food', 'halal', 'bestseller', 'pakistani'],
    image_url: '/items/cheese-omelet.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-french-toast',
    name: 'French Toast with Chai',
    description: 'Sweet golden french toast dusted with powdered sugar, topped with fresh strawberries and banana slices, drizzled with maple syrup. Served with a hot cup of desi chai.',
    price: 250,
    calories: 380,
    protein_g: 10,
    carbs_g: 52,
    fat_g: 14,
    category: 'breakfast',
    tags: ['Sweet Start', 'Delicious & Satisfying', 'halal', 'popular', 'budget-friendly'],
    image_url: '/items/french-toast.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-paratha-chai',
    name: 'Paratha Chai',
    description: 'Hot flaky layered parathas cooked on tawa with butter, served with fresh green chutney and a steaming glass of desi chai. Simple food, big comfort.',
    price: 250,
    calories: 350,
    protein_g: 8,
    carbs_g: 46,
    fat_g: 16,
    category: 'breakfast',
    tags: ['Simple Food', 'Big Comfort', 'Homemade Goodness', 'halal', 'pakistani', 'budget-friendly'],
    image_url: '/items/paratha-chai.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-paratha-anda-chai',
    name: 'Paratha Anda Chai',
    description: 'Hot flaky layered parathas served with spiced scrambled eggs (anda) cooked with tomatoes, green chillies and onions, green chutney, and a steaming glass of desi chai.',
    price: 450,
    calories: 520,
    protein_g: 22,
    carbs_g: 48,
    fat_g: 24,
    category: 'breakfast',
    tags: ['Homemade Goodness', 'Simple Food', 'Big Comfort', 'halal', 'pakistani', 'high-protein'],
    image_url: '/items/paratha-anda-chai.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-pancakes-chai',
    name: 'Pancakes with Chai',
    description: 'Fluffy stacked pancakes with your choice of chocolate or blueberry topping, garnished with banana slices and chocolate chunks. Served with a hot cup of desi chai.',
    price: 300,
    calories: 440,
    protein_g: 10,
    carbs_g: 62,
    fat_g: 18,
    category: 'breakfast',
    tags: ['Sweet & Fluffy', 'Good Food Good Mood', 'halal', 'popular', 'dessert'],
    image_url: '/items/pancakes-chai.jpg',
    variants: [{ name: 'Chocolate' }, { name: 'Blueberry' }],
    status: 'active',
    is_featured: true,
    sort_order: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-chicken-biryani',
    name: 'Chicken Biryani',
    description: 'Authentic Hyderabadi-style chicken biryani with fragrant saffron basmati rice, tender bone-in chicken, crispy fried onions, and aromatic spices. Served with raita & fresh salad.',
    price: 450,
    calories: 680,
    protein_g: 40,
    carbs_g: 78,
    fat_g: 22,
    category: 'rice',
    tags: ['Authentic Flavors', 'Good Food Good Mood', 'halal', 'bestseller', 'pakistani', 'high-protein'],
    image_url: '/items/chicken-biryani.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-high-protein-wrap',
    name: 'High Protein Wrap',
    description: 'Whole wheat tortilla packed with grilled seasoned chicken breast, fresh lettuce, diced tomatoes, red onions, cucumber, and creamy herb sauce. More protein, more you!',
    price: 600,
    calories: 350,
    protein_g: 42,
    carbs_g: 28,
    fat_g: 10,
    category: 'wrap',
    tags: ['High Protein', 'More Protein More You', 'halal', 'healthy', 'low-calorie', 'popular'],
    image_url: '/items/high-protein-wrap.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 11,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-keto-wrap',
    name: 'Keto Wrap',
    description: 'Low-carb spinach tortilla filled with grilled chicken, fresh cucumber, leafy greens, avocado, and light dressing. Low carb, big flavor!',
    price: 600,
    calories: 320,
    protein_g: 36,
    carbs_g: 12,
    fat_g: 16,
    category: 'wrap',
    tags: ['Low Carb', 'Big Flavor', 'keto', 'halal', 'healthy', 'low-calorie'],
    image_url: '/items/keto-wrap.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-chicken-karahi',
    name: 'Chicken Karahi',
    description: 'Freshly cooked bone-in chicken in a rich tomato-based gravy with ginger, green chillies, and fresh cilantro. Real desi taste, served sizzling hot in a traditional karahi.',
    price: 450,
    calories: 550,
    protein_g: 44,
    carbs_g: 12,
    fat_g: 34,
    category: 'main',
    tags: ['Authentic Flavors', 'Real Desi Taste', 'Freshly Cooked', 'halal', 'pakistani', 'high-protein'],
    image_url: '/items/chicken-karahi.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 13,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-chicken-fajita-rice-bowl',
    name: 'Chicken Fajita Rice Bowl',
    description: 'Fluffy white rice topped with grilled fajita-seasoned chicken, sautéed colorful bell peppers, sliced cucumber, pickled red onions, shredded lettuce, and drizzled with creamy garlic sauce.',
    price: 850,
    calories: 620,
    protein_g: 46,
    carbs_g: 68,
    fat_g: 16,
    category: 'bowl',
    tags: ['Loaded Bowl', 'Flavourful', 'halal', 'high-protein', 'popular'],
    image_url: '/items/chicken-fajita-rice-bowl.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-chicken-qeema',
    name: 'Chicken Qeema',
    description: 'Rich and flavorful minced chicken cooked with tomatoes, onions, and aromatic spices, garnished with ginger julienne, green chillies, and fresh cilantro. Homemade goodness in every bite.',
    price: 550,
    calories: 480,
    protein_g: 38,
    carbs_g: 10,
    fat_g: 30,
    category: 'main',
    tags: ['Rich Flavors', 'Homemade Goodness', 'halal', 'pakistani', 'high-protein', 'popular'],
    image_url: '/items/chicken-qeema.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-kabab-masala',
    name: 'Kabab Masala',
    description: 'Classic spiced beef kababs simmered in a rich tomato-based masala gravy with ginger, green chillies, and fresh cilantro. A timeless desi classic with bold flavors.',
    price: 450,
    calories: 520,
    protein_g: 40,
    carbs_g: 14,
    fat_g: 32,
    category: 'main',
    tags: ['Classic Taste', 'Rich Flavors', 'Homemade Goodness', 'halal', 'pakistani', 'high-protein'],
    image_url: '/items/kabab-masala.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 16,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-high-protein-chicken-burger',
    name: 'High-Protein Chicken Burger',
    description: 'Thick grilled chicken patty on a whole wheat seeded bun, loaded with fresh lettuce, sliced tomato, red onion, cucumber, and creamy herb sauce. High protein, maximum flavor.',
    price: 650,
    calories: 480,
    protein_g: 48,
    carbs_g: 36,
    fat_g: 16,
    category: 'burger',
    tags: ['High Protein', 'Grilled Chicken Patty', 'Whole Wheat Bun', 'halal', 'healthy', 'popular'],
    image_url: '/items/high-protein-chicken-burger.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 17,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-makhni-handi',
    name: 'Makhni Handi',
    description: 'Tender chicken pieces slow-cooked in a rich, creamy butter sauce with aromatic spices, served in a traditional clay handi. Garnished with cream drizzle and fresh cilantro.',
    price: 550,
    calories: 620,
    protein_g: 36,
    carbs_g: 16,
    fat_g: 42,
    category: 'main',
    tags: ['Rich Flavors', 'Homemade Goodness', 'halal', 'pakistani', 'bestseller'],
    image_url: '/items/makhni-handi.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'camos-honey-garlic-mac-n-cheese',
    name: 'Honey Garlic Butter Chicken Mac N Cheese',
    description: 'Creamy cheesy elbow macaroni topped with honey garlic glazed chicken bites, garnished with fresh parsley and red chilli flakes. An indulgent fusion of comfort food perfection.',
    price: 950,
    calories: 780,
    protein_g: 40,
    carbs_g: 72,
    fat_g: 36,
    category: 'pasta',
    tags: ['Indulgent', 'Cheesy Goodness', 'Fusion', 'halal', 'popular', 'bestseller'],
    image_url: '/items/honey-garlic-mac-n-cheese.jpg',
    status: 'active',
    is_featured: true,
    sort_order: 19,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function enrichFoodItem(rawItem: any): FoodItem {
  if (!rawItem) return REAL_MENU_ITEMS[0]

  const rawName = (rawItem.name || '').toLowerCase()
  const rawId = (rawItem.id || '').toLowerCase()

  // Match with local baseline item if possible
  const matched = REAL_MENU_ITEMS.find(
    (i) =>
      i.id.toLowerCase() === rawId ||
      i.name.toLowerCase() === rawName ||
      (rawName.length > 3 && i.name.toLowerCase().includes(rawName)) ||
      (rawName.length > 3 && rawName.includes(i.name.toLowerCase()))
  )

  const calories = Number(rawItem.calories) || matched?.calories || 500
  let protein_g = Number(rawItem.protein_g) || 0
  let carbs_g = Number(rawItem.carbs_g) || 0
  let fat_g = Number(rawItem.fat_g) || 0

  // If DB macros are 0 or missing, use matched baseline or calculate realistic macro split
  if (!protein_g && !carbs_g && !fat_g) {
    if (matched) {
      protein_g = matched.protein_g
      carbs_g = matched.carbs_g
      fat_g = matched.fat_g
    } else {
      protein_g = Math.round((calories * 0.30) / 4)
      carbs_g = Math.round((calories * 0.50) / 4)
      fat_g = Math.round((calories * 0.20) / 9)
    }
  }

  const ingredients =
    Array.isArray(rawItem.ingredients) && rawItem.ingredients.length > 0
      ? rawItem.ingredients
      : matched?.ingredients || getDefaultIngredients(rawItem.name || matched?.name || '', rawItem.category || matched?.category || '')

  const allergens =
    Array.isArray(rawItem.allergens) && rawItem.allergens.length > 0
      ? rawItem.allergens
      : matched?.allergens || getDefaultAllergens(rawItem.name || matched?.name || '')

  const serving_size = rawItem.serving_size || matched?.serving_size || '1 Serving (approx. 400g)'

  return {
    ...matched,
    ...rawItem,
    id: rawItem.id || matched?.id || 'camos-item',
    name: rawItem.name || matched?.name || 'Camo\'s Special Dish',
    description: rawItem.description || matched?.description || 'Authentic gourmet meal prepared fresh with 100% Halal premium ingredients.',
    price: Number(rawItem.price) || matched?.price || 500,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    category: rawItem.category || matched?.category || 'main',
    tags: rawItem.tags || matched?.tags || ['halal', 'fresh', 'popular'],
    image_url: rawItem.image_url || matched?.image_url || '/hero-plate.jpg',
    status: rawItem.status || matched?.status || 'active',
    is_featured: rawItem.is_featured ?? matched?.is_featured ?? true,
    sort_order: rawItem.sort_order ?? matched?.sort_order ?? 99,
    variants: rawItem.variants || matched?.variants,
    ingredients,
    allergens,
    serving_size,
    created_at: rawItem.created_at || new Date().toISOString(),
    updated_at: rawItem.updated_at || new Date().toISOString(),
  }
}

function getDefaultIngredients(name: string, category: string): string[] {
  const lower = name.toLowerCase()
  if (lower.includes('pulao') || lower.includes('biryani') || lower.includes('rice')) {
    return ['Aromatic Basmati Rice', 'Halal Bone-in / Boneless Chicken', 'Caramelized Onions', 'Whole Garam Masala Blend', 'Pure Ghee & Mint Raita']
  }
  if (lower.includes('pasta') || lower.includes('mac')) {
    return ['Al Dente Pasta', 'Garlic Parmesan Alfredo Cream', 'Seasoned Grilled Chicken Strips', 'Butter & Fresh Parsley']
  }
  if (lower.includes('wrap') || lower.includes('tacos') || lower.includes('burger')) {
    return ['Soft Flour Tortilla / Bun', 'Grilled Chicken Breast', 'Crisp Lettuce & Tomatoes', 'Red Onions & Cucumber', 'Signature Garlic Cream Sauce']
  }
  if (lower.includes('karahi') || lower.includes('qeema') || lower.includes('masala') || lower.includes('handi')) {
    return ['Fresh Halal Meat', 'Tomato Ginger Masala Gravy', 'Green Chillies & Cilantro', 'Desi Ghee & Crushed Spices']
  }
  if (category === 'breakfast' || lower.includes('omelet') || lower.includes('toast') || lower.includes('paratha') || lower.includes('pancake')) {
    return ['Farm Fresh Eggs', 'Crispy Layered Paratha / Toast', 'Butter & Fresh Herbs', 'Steaming Hot Desi Doodh Patti Chai']
  }
  return ['100% Halal Premium Meat', 'Chef Special Spice Blend', 'Fresh Organic Herbs', 'Pure Ghee & Olive Oil']
}

function getDefaultAllergens(name: string): string[] {
  const lower = name.toLowerCase()
  const allergens: string[] = []
  if (lower.includes('cheese') || lower.includes('cream') || lower.includes('pancake') || lower.includes('pasta') || lower.includes('handi') || lower.includes('chai') || lower.includes('omelet') || lower.includes('mac')) {
    allergens.push('Dairy')
  }
  if (lower.includes('pasta') || lower.includes('wrap') || lower.includes('burger') || lower.includes('tacos') || lower.includes('paratha') || lower.includes('toast') || lower.includes('pancake') || lower.includes('mac')) {
    allergens.push('Gluten')
  }
  if (lower.includes('omelet') || lower.includes('toast') || lower.includes('pancake') || lower.includes('anda')) {
    allergens.push('Egg')
  }
  if (lower.includes('chilli dry')) {
    allergens.push('Soy')
  }
  if (allergens.length === 0) {
    allergens.push('100% Halal (Nut-Free)')
  }
  return allergens
}

