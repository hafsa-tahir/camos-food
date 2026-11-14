export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

export interface DailySchedulePlan {
  day: DayOfWeek
  dietDishId: string
  dietDishName: string
  dietTagline: string
  desiDishId: string
  desiDishName: string
  desiTagline: string
  winterDishId: string
  winterDishName: string
  winterTagline: string
}

export const WEEKLY_SCHEDULE: Record<DayOfWeek, DailySchedulePlan> = {
  Monday: {
    day: 'Monday',
    dietDishId: 'camos-chicken-fajita-rice-bowl',
    dietDishName: 'Chicken Fajita Rice Bowl',
    dietTagline: 'High-Protein Grilled Fajita Chicken & Rice Bowl',
    desiDishId: 'camos-chicken-karahi',
    desiDishName: 'Chicken Karahi',
    desiTagline: 'Authentic Wok-Cooked Desi Karahi with Fresh Ginger',
    winterDishId: 'camos-chicken-karahi',
    winterDishName: 'Chicken Karahi',
    winterTagline: 'Winter Menu Special • Sizzling Wok-Cooked Chicken Karahi',
  },
  Tuesday: {
    day: 'Tuesday',
    dietDishId: 'camos-high-protein-wrap',
    dietDishName: 'High Protein Wrap',
    dietTagline: 'Whole Wheat Tortilla with Tender Lean Chicken & Herbs',
    desiDishId: 'camos-kabab-masala',
    desiDishName: 'Kabab Masala',
    desiTagline: 'Spiced Beef Kababs Simmered in Rich Tomato Masala Gravy',
    winterDishId: 'camos-kofta-curry',
    winterDishName: 'Kofta Curry',
    winterTagline: 'Winter Menu Special • Juicy Meatballs in Rich Traditional Gravy',
  },
  Wednesday: {
    day: 'Wednesday',
    dietDishId: 'camos-chicken-chilli-dry',
    dietDishName: 'Chicken Chilli Dry with Rice',
    dietTagline: 'Wok-Tossed Boneless Chicken Glazed in Spicy Savory Chilli Sauce',
    desiDishId: 'camos-chicken-qeema',
    desiDishName: 'Chicken Qeema',
    desiTagline: 'Slow-Cooked Minced Chicken with Fragrant Green Peas & Spices',
    winterDishId: 'camos-matar-qeema',
    winterDishName: 'Matar Qeema',
    winterTagline: 'Winter Menu Special • Homestyle Minced Meat & Sweet Green Peas',
  },
  Thursday: {
    day: 'Thursday',
    dietDishId: 'camos-high-protein-chicken-burger',
    dietDishName: 'High-Protein Chicken Burger',
    dietTagline: 'Thick Flame-Grilled Patty on Seeded Whole Wheat Bun',
    desiDishId: 'camos-makhni-handi',
    desiDishName: 'Makhni Handi',
    desiTagline: 'Velvety Slow-Cooked Butter Chicken in Traditional Handi',
    winterDishId: 'camos-makhni-handi',
    winterDishName: 'Chicken Makhni Handi',
    winterTagline: 'Winter Menu Special • Creamy Butter Chicken in Clay Handi',
  },
  Friday: {
    day: 'Friday',
    dietDishId: 'camos-chicken-tacos',
    dietDishName: 'Chicken Tacos',
    dietTagline: 'Three Flour Tortillas Loaded with Grilled Chicken & Lime',
    desiDishId: 'camos-chicken-pulao',
    desiDishName: 'Chicken Pulao',
    desiTagline: 'Aromatic Friday Basmati Pulao with Mint Raita & Salad',
    winterDishId: 'camos-chicken-biryani',
    winterDishName: 'Chicken Biryani',
    winterTagline: 'Winter Menu Special • Fragrant Friday Saffron Basmati Biryani',
  },
  Saturday: {
    day: 'Saturday',
    dietDishId: 'camos-keto-wrap',
    dietDishName: 'Keto Wrap',
    dietTagline: 'Ultra Low-Carb Spinach Tortilla Packed with Grilled Chicken',
    desiDishId: 'camos-creamy-chicken-pasta',
    desiDishName: 'Creamy Chicken Pasta',
    desiTagline: 'Al Dente Penne Tossed in Homemade Garlic Parmesan Alfredo',
    winterDishId: 'camos-chicken-korma',
    winterDishName: 'Chicken Korma',
    winterTagline: 'Winter Menu Special • Royal Braised Chicken Korma with Almonds',
  },
  Sunday: {
    day: 'Sunday',
    dietDishId: 'camos-honey-garlic-mac-n-cheese',
    dietDishName: 'Honey Garlic Butter Chicken Mac N Cheese',
    dietTagline: 'Cheesy Comfort Macaroni with Honey Garlic Glazed Bites',
    desiDishId: 'camos-chicken-biryani',
    desiDishName: 'Chicken Biryani',
    desiTagline: 'Royal Hyderabadi Saffron Basmati Biryani with Tender Chicken',
    winterDishId: 'camos-beef-nihari',
    winterDishName: 'Beef Nihari',
    winterTagline: 'Winter Menu Special • Slow-Simmered Sunday Beef Shank Nihari',
  },
}

/**
 * Returns current day of the week in Pakistan Standard Time (Asia/Karachi, UTC+5)
 */
export function getPakistanDayOfWeek(): DayOfWeek {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
    })
    return formatter.format(new Date()) as DayOfWeek
  } catch {
    // Fallback to local machine day
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }
}

/**
 * Returns formatted date string in Pakistan Standard Time (e.g. "Monday, October 14")
 */
export function getPakistanFormattedDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    return formatter.format(new Date())
  } catch {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }
}

/**
 * Map of every known dish (by ID or normalized name) to the day it is cooked
 */
export const DISH_DAY_MAPPING: Record<string, DayOfWeek> = {
  // Monday
  'camos-chicken-fajita-rice-bowl': 'Monday',
  'chicken fajita rice bowl': 'Monday',
  'camos-chicken-karahi': 'Monday',
  'chicken karahi': 'Monday',

  // Tuesday
  'camos-high-protein-wrap': 'Tuesday',
  'high protein wrap': 'Tuesday',
  'camos-kabab-masala': 'Tuesday',
  'kabab masala': 'Tuesday',
  'camos-kofta-curry': 'Tuesday',
  'kofta curry': 'Tuesday',

  // Wednesday
  'camos-chicken-chilli-dry': 'Wednesday',
  'chicken chilli dry with rice': 'Wednesday',
  'chicken chilli dry': 'Wednesday',
  'camos-chicken-qeema': 'Wednesday',
  'chicken qeema': 'Wednesday',
  'beef qeema': 'Wednesday',
  'qeema': 'Wednesday',
  'camos-matar-qeema': 'Wednesday',
  'matar qeema': 'Wednesday',

  // Thursday
  'camos-high-protein-chicken-burger': 'Thursday',
  'high-protein chicken burger': 'Thursday',
  'high protein chicken burger': 'Thursday',
  'camos-makhni-handi': 'Thursday',
  'makhni handi': 'Thursday',
  'chicken makhni handi': 'Thursday',
  'butter chicken': 'Thursday',

  // Friday
  'camos-chicken-tacos': 'Friday',
  'chicken tacos': 'Friday',
  'camos-chicken-pulao': 'Friday',
  'chicken pulao': 'Friday',
  'special pulao': 'Friday',

  // Saturday
  'camos-keto-wrap': 'Saturday',
  'keto wrap': 'Saturday',
  'crispy garlic chicken fried rice': 'Saturday',
  'camos-creamy-chicken-pasta': 'Saturday',
  'creamy chicken pasta': 'Saturday',
  'special pasta': 'Saturday',
  'camos-chicken-korma': 'Saturday',
  'chicken korma': 'Saturday',

  // Sunday
  'camos-honey-garlic-mac-n-cheese': 'Sunday',
  'honey garlic butter chicken mac n cheese': 'Sunday',
  'honey garlic mac & cheese': 'Sunday',
  'camos-chicken-biryani': 'Sunday',
  'chicken biryani': 'Sunday',
  'royal chicken biryani': 'Sunday',
  'camos-beef-nihari': 'Sunday',
  'beef nihari': 'Sunday',
}

export interface DishAvailability {
  isAvailableToday: boolean
  isBreakfast: boolean
  isSpecialToday: boolean
  specialType?: 'desi' | 'diet' | 'winter'
  cookedOnDay?: DayOfWeek
  statusLabel: string
  badgeLabel: string
}

/**
 * Calculates dynamic availability for a dish on a specific day (defaults to Pakistan today)
 */
export function getDishAvailability(
  item: { id?: string; name?: string; category?: string; status?: string },
  currentDay: DayOfWeek = getPakistanDayOfWeek()
): DishAvailability {
  const category = (item.category || '').toLowerCase()
  const nameLower = (item.name || '').toLowerCase()
  const idLower = (item.id || '').toLowerCase()

  // 1. Breakfast is ALWAYS available every single day
  if (
    category === 'breakfast' ||
    nameLower.includes('omelet') ||
    nameLower.includes('toast') ||
    nameLower.includes('paratha') ||
    nameLower.includes('pancake')
  ) {
    return {
      isAvailableToday: true,
      isBreakfast: true,
      isSpecialToday: false,
      statusLabel: 'Available Today',
      badgeLabel: 'Daily Breakfast',
    }
  }

  // 1b. Winter Special Chicken Corn Soup is ALWAYS available every single day (just like breakfast)
  if (idLower === 'camos-chicken-corn-soup' || nameLower.includes('corn soup') || nameLower.includes('soup')) {
    return {
      isAvailableToday: true,
      isBreakfast: true,
      isSpecialToday: false,
      statusLabel: 'Available Today',
      badgeLabel: 'Available Daily',
    }
  }

  // 2. Today's Plan
  const todayPlan = WEEKLY_SCHEDULE[currentDay]

  // Check if it's today's Desi Dish
  const isTodayDesi =
    idLower === todayPlan.desiDishId.toLowerCase() ||
    nameLower === todayPlan.desiDishName.toLowerCase() ||
    (nameLower.length > 5 && todayPlan.desiDishName.toLowerCase().includes(nameLower))

  if (isTodayDesi) {
    return {
      isAvailableToday: true,
      isBreakfast: false,
      isSpecialToday: true,
      specialType: 'desi',
      cookedOnDay: currentDay,
      statusLabel: "Available Today (Today's Desi Special)",
      badgeLabel: "Today's Desi Special",
    }
  }

  // Check if it's today's Diet Dish
  const isTodayDiet =
    idLower === todayPlan.dietDishId.toLowerCase() ||
    nameLower === todayPlan.dietDishName.toLowerCase() ||
    (nameLower.length > 5 && todayPlan.dietDishName.toLowerCase().includes(nameLower))

  if (isTodayDiet) {
    return {
      isAvailableToday: true,
      isBreakfast: false,
      isSpecialToday: true,
      specialType: 'diet',
      cookedOnDay: currentDay,
      statusLabel: "Available Today (Today's Diet Special)",
      badgeLabel: "Today's Diet Special",
    }
  }

  // Check if it's today's Winter Dish
  const isTodayWinter =
    idLower === todayPlan.winterDishId.toLowerCase() ||
    nameLower === todayPlan.winterDishName.toLowerCase() ||
    (nameLower.length > 5 && todayPlan.winterDishName.toLowerCase().includes(nameLower))

  if (isTodayWinter) {
    return {
      isAvailableToday: true,
      isBreakfast: false,
      isSpecialToday: true,
      specialType: 'winter',
      cookedOnDay: currentDay,
      statusLabel: "Available Today (Today's Winter Special)",
      badgeLabel: "Today's Winter Special",
    }
  }

  // 3. Otherwise: NOT AVAILABLE TODAY
  // Find which day of the week it is scheduled for
  const scheduledDay =
    DISH_DAY_MAPPING[idLower] ||
    DISH_DAY_MAPPING[nameLower] ||
    Object.entries(DISH_DAY_MAPPING).find(([key]) => nameLower.includes(key))?.[1]

  const dayNotice = scheduledDay ? `Available on ${scheduledDay}` : 'Not Available Today'

  return {
    isAvailableToday: false,
    isBreakfast: false,
    isSpecialToday: false,
    cookedOnDay: scheduledDay,
    statusLabel: dayNotice,
    badgeLabel: scheduledDay ? `Cooked on ${scheduledDay}` : 'Not Available',
  }
}
