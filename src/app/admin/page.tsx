'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  TrendingUp,
  Package,
  Tag,
  Users,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Phone,
  MapPin,
  QrCode,
  Banknote,
  Sparkles,
  ShieldCheck,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  UserCheck,
  LogOut,
  Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  price_at_order: number
  name_at_order: string
  food_items?: { name: string }
}

interface Order {
  id: string
  created_at: string
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'
  subtotal: number
  discount_amount: number
  total: number
  delivery_address: string
  notes?: string
  customers?: { name: string; email: string; phone: string }
  order_items: OrderItem[]
}

interface FoodItem {
  id: string
  name: string
  description?: string
  price: number
  calories: number
  protein_g?: number
  carbs_g?: number
  fat_g?: number
  tags?: string[]
  category?: string
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  is_featured?: boolean
  sort_order?: number
  image_url?: string
  serving_size?: string
  ingredients?: string[]
  allergens?: string[]
  variants?: { name: string; price?: number }[]
}

const PRESET_IMAGES = [
  { label: 'Chicken Karahi', url: '/items/chicken-karahi.jpg' },
  { label: 'Chicken Biryani', url: '/items/chicken-biryani.jpg' },
  { label: 'Chicken Pulao', url: '/items/chicken-pulao.jpg' },
  { label: 'Chicken Corn Soup', url: '/items/chicken-corn-soup.jpg' },
  { label: 'Kofta Curry', url: '/items/kofta-curry.jpg' },
  { label: 'Matar Qeema', url: '/items/matar-qeema.jpg' },
  { label: 'Chicken Korma', url: '/items/chicken-korma.jpg' },
  { label: 'Beef Nihari', url: '/items/beef-nihari.jpg' },
  { label: 'Makhni Handi', url: '/items/makhni-handi.jpg' },
  { label: 'Kabab Masala', url: '/items/kabab-masala.jpg' },
  { label: 'Chicken Qeema', url: '/items/chicken-qeema.jpg' },
  { label: 'Chilli Dry + Rice', url: '/items/chicken-chilli-dry.jpg' },
  { label: 'Fajita Rice Bowl', url: '/items/chicken-fajita-rice-bowl.jpg' },
  { label: 'Creamy Pasta', url: '/items/creamy-chicken-pasta.jpg' },
  { label: 'Honey Garlic Mac', url: '/items/honey-garlic-mac-n-cheese.jpg' },
  { label: 'Chicken Tacos', url: '/items/chicken-tacos.jpg' },
  { label: 'Protein Wrap', url: '/items/high-protein-wrap.jpg' },
  { label: 'Keto Wrap', url: '/items/keto-wrap.jpg' },
  { label: 'Protein Burger', url: '/items/high-protein-chicken-burger.jpg' },
  { label: 'Cheese Omelet', url: '/items/cheese-omelet.jpg' },
  { label: 'French Toast', url: '/items/french-toast.jpg' },
  { label: 'Paratha Chai', url: '/items/paratha-chai.jpg' },
  { label: 'Paratha Anda Chai', url: '/items/paratha-anda-chai.jpg' },
  { label: 'Pancakes Chai', url: '/items/pancakes-chai.jpg' },
]

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

interface Deal {
  id: string
  title: string
  description?: string
  discount_type: 'percentage' | 'flat'
  discount_value: number
  min_order_amount?: number
  is_active: boolean
}

interface Subscription {
  id: string
  user_name: string
  phone: string
  email?: string
  package_plan: string
  status: 'active' | 'paused' | 'expired'
  start_date?: string
  notes?: string
  created_at?: string
}

export default function AdminDashboardPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [adminEmail, setAdminEmail] = useState('admin@camosfoods.com')
  const [adminPassword, setAdminPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'subscriptions' | 'deals'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  const [loadingOrders, setLoadingOrders] = useState(false)
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [loadingDeals, setLoadingDeals] = useState(false)
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Full Product Modal State (Add / Edit Food Item)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    calories: '550',
    protein_g: '35',
    carbs_g: '50',
    fat_g: '18',
    category: 'main',
    image_url: '/items/chicken-karahi.jpg',
    availabilityMode: 'everyday' as 'everyday' | 'specific_days',
    selectedDays: ['Monday'] as string[],
    specialSlot: 'none' as 'none' | 'desi' | 'diet' | 'winter',
    serving_size: '1 Serving (approx. 400g)',
    ingredients: '100% Halal Meat, Fresh Organic Herbs, Chef Special Spice Blend',
    allergens: '100% Halal (Nut-Free)',
    variants: '',
    customTags: 'halal, fresh, popular',
    is_featured: true,
    sort_order: '10',
    status: 'active' as 'active' | 'inactive',
  })
  const [savingItem, setSavingItem] = useState(false)

  // Weekly Menu Plan Builder Modal State (Add / Edit Weekly Package Plan)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [planForm, setPlanForm] = useState({
    title: '',
    category: 'desi' as 'desi' | 'diet',
    badge: 'Weekly Subscription',
    daysCount: 7 as 5 | 7,
    price: '4400',
    subtitle: 'Monday to Sunday • Full Week Plan',
    image_url: '/items/beef-nihari.jpg',
    highlights: '100% Halal & Freshly Cooked, Daily Doorstep Delivery, Rich Traditional Flavors, All Meals Included',
    days: [
      { day: 'Monday', title: 'Chicken Karahi', desc: 'Authentic wok-cooked chicken karahi with tomatoes & ginger', tag: 'Monday Special' },
      { day: 'Tuesday', title: 'Kofta Curry', desc: 'Juicy spiced meatballs simmered in rich curry gravy', tag: 'Chef Choice' },
      { day: 'Wednesday', title: 'Matar Qeema', desc: 'Homestyle spiced minced meat slow-cooked with sweet green peas', tag: 'Home Style' },
      { day: 'Thursday', title: 'Chicken Makhni Handi', desc: 'Velvety cream & butter gravy with tender boneless chicken', tag: 'Popular' },
      { day: 'Friday', title: 'Chicken Biryani', desc: 'Fragrant saffron basmati rice layered with tender spiced chicken', tag: 'Friday Feast' },
      { day: 'Saturday', title: 'Chicken Korma', desc: 'Royal Mughlai-style chicken braised in rich almond gravy', tag: 'Weekend Special' },
      { day: 'Sunday', title: 'Beef Nihari', desc: 'Slow-simmered overnight tender beef shank stew with ginger', tag: 'Sunday Feast' },
    ],
  })
  const [savingPlan, setSavingPlan] = useState(false)

  // Weekly Subscriptions Modal State
  const [showSubModal, setShowSubModal] = useState(false)
  const [newSub, setNewSub] = useState({
    user_name: '',
    phone: '',
    email: '',
    package_plan: '7-Day Winter Desi Plan',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [savingSub, setSavingSub] = useState(false)

  // Compress & convert uploaded image file to Data URL for immediate storage in Supabase
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onDone: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxDim = 800
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w)
            w = maxDim
          } else {
            w = Math.round((w * maxDim) / h)
            h = maxDim
          }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, w, h)
        const compressed = canvas.toDataURL('image/jpeg', 0.84)
        onDone(compressed)
        toast.success('Image uploaded and optimized!')
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const openAddProductModal = () => {
    setEditingItemId(null)
    setNewItem({
      name: '',
      description: '',
      price: '',
      calories: '550',
      protein_g: '35',
      carbs_g: '50',
      fat_g: '18',
      category: 'main',
      image_url: '/items/chicken-karahi.jpg',
      availabilityMode: 'everyday',
      selectedDays: ['Monday'],
      specialSlot: 'none',
      serving_size: '1 Serving (approx. 400g)',
      ingredients: '100% Halal Meat, Fresh Organic Herbs, Chef Special Spice Blend',
      allergens: '100% Halal (Nut-Free)',
      variants: '',
      customTags: 'halal, fresh, popular',
      is_featured: true,
      sort_order: '10',
      status: 'active',
    })
    setShowItemModal(true)
  }

  const openEditProductModal = (item: FoodItem) => {
    const rawTags = Array.isArray(item.tags) ? item.tags : []
    const availDayTags = rawTags
      .filter((t) => t.toLowerCase().startsWith('avail:') && t.toLowerCase() !== 'avail:everyday')
      .map((t) => t.slice(6))
    const hasEveryday =
      rawTags.some((t) => t.toLowerCase() === 'avail:everyday') ||
      item.category === 'breakfast' ||
      item.name.toLowerCase().includes('soup')

    const slotTag = rawTags.find((t) => t.toLowerCase().startsWith('slot:'))?.slice(5) as
      | 'desi'
      | 'diet'
      | 'winter'
      | undefined
    const servingTag = rawTags.find((t) => t.startsWith('serving:'))?.slice(8)
    const ingTag = rawTags.find((t) => t.startsWith('ing:'))?.slice(4)
    const allgTag = rawTags.find((t) => t.startsWith('allg:'))?.slice(5)
    const varTag = rawTags.find((t) => t.startsWith('var:'))?.slice(4)
    const displayTags = rawTags.filter((t) => !t.includes(':'))

    setEditingItemId(item.id)
    setNewItem({
      name: item.name || '',
      description: item.description || '',
      price: String(item.price || 550),
      calories: String(item.calories || 500),
      protein_g: String(item.protein_g ?? 35),
      carbs_g: String(item.carbs_g ?? 50),
      fat_g: String(item.fat_g ?? 18),
      category: item.category || 'main',
      image_url: item.image_url || '/items/chicken-karahi.jpg',
      availabilityMode: availDayTags.length > 0 ? 'specific_days' : hasEveryday ? 'everyday' : 'everyday',
      selectedDays: availDayTags.length > 0 ? availDayTags : ['Monday'],
      specialSlot: slotTag || 'none',
      serving_size: servingTag || item.serving_size || '1 Serving (approx. 400g)',
      ingredients:
        ingTag
          ? ingTag.split('|').join(', ')
          : Array.isArray(item.ingredients)
          ? item.ingredients.join(', ')
          : '100% Halal Meat, Fresh Organic Herbs, Chef Special Spice Blend',
      allergens:
        allgTag
          ? allgTag.split('|').join(', ')
          : Array.isArray(item.allergens)
          ? item.allergens.join(', ')
          : '100% Halal (Nut-Free)',
      variants:
        varTag
          ? varTag.split('|').join(', ')
          : Array.isArray(item.variants)
          ? item.variants.map((v) => v.name).join(', ')
          : '',
      customTags: displayTags.length > 0 ? displayTags.join(', ') : 'halal, fresh, popular',
      is_featured: item.is_featured ?? true,
      sort_order: String(item.sort_order ?? 10),
      status: item.status === 'inactive' ? 'inactive' : 'active',
    })
    setShowItemModal(true)
  }

  const openAddPlanModal = () => {
    setEditingPlanId(null)
    setPlanForm({
      title: '',
      category: 'desi',
      badge: 'Weekly Subscription',
      daysCount: 7,
      price: '4400',
      subtitle: 'Monday to Sunday • Full Week Plan',
      image_url: '/items/beef-nihari.jpg',
      highlights: '100% Halal & Freshly Cooked, Daily Doorstep Delivery, Rich Traditional Flavors, All Meals Included',
      days: [
        { day: 'Monday', title: 'Chicken Karahi', desc: 'Authentic wok-cooked chicken karahi with tomatoes & ginger', tag: 'Monday Special' },
        { day: 'Tuesday', title: 'Kofta Curry', desc: 'Juicy spiced meatballs simmered in rich curry gravy', tag: 'Chef Choice' },
        { day: 'Wednesday', title: 'Matar Qeema', desc: 'Homestyle spiced minced meat slow-cooked with sweet green peas', tag: 'Home Style' },
        { day: 'Thursday', title: 'Chicken Makhni Handi', desc: 'Velvety cream & butter gravy with tender boneless chicken', tag: 'Popular' },
        { day: 'Friday', title: 'Chicken Biryani', desc: 'Fragrant saffron basmati rice layered with tender spiced chicken', tag: 'Friday Feast' },
        { day: 'Saturday', title: 'Chicken Korma', desc: 'Royal Mughlai-style chicken braised in rich almond gravy', tag: 'Weekend Special' },
        { day: 'Sunday', title: 'Beef Nihari', desc: 'Slow-simmered overnight tender beef shank stew with ginger', tag: 'Sunday Feast' },
      ],
    })
    setShowPlanModal(true)
  }

  const openEditPlanModal = (item: FoodItem) => {
    const rawTags = Array.isArray(item.tags) ? item.tags : []
    const metaTag = rawTags.find((t) => t.startsWith('plan_meta:'))
    let meta: any = {}
    if (metaTag) {
      try {
        meta = JSON.parse(metaTag.slice(10))
      } catch {}
    }
    const default7 = [
      { day: 'Monday', title: 'Chicken Karahi', desc: 'Authentic wok-cooked chicken karahi with tomatoes & ginger', tag: 'Monday Special' },
      { day: 'Tuesday', title: 'Kofta Curry', desc: 'Juicy spiced meatballs simmered in rich curry gravy', tag: 'Chef Choice' },
      { day: 'Wednesday', title: 'Matar Qeema', desc: 'Homestyle spiced minced meat slow-cooked with sweet green peas', tag: 'Home Style' },
      { day: 'Thursday', title: 'Chicken Makhni Handi', desc: 'Velvety cream & butter gravy with tender boneless chicken', tag: 'Popular' },
      { day: 'Friday', title: 'Chicken Biryani', desc: 'Fragrant saffron basmati rice layered with tender spiced chicken', tag: 'Friday Feast' },
      { day: 'Saturday', title: 'Chicken Korma', desc: 'Royal Mughlai-style chicken braised in rich almond gravy', tag: 'Weekend Special' },
      { day: 'Sunday', title: 'Beef Nihari', desc: 'Slow-simmered overnight tender beef shank stew with ginger', tag: 'Sunday Feast' },
    ]
    const daysCount = meta.daysCount === 5 || item.name.includes('5-Day') ? 5 : 7
    const existingDays = Array.isArray(meta.days) && meta.days.length > 0 ? meta.days : default7

    setEditingPlanId(item.id)
    setPlanForm({
      title: item.name,
      category: meta.category === 'diet' || item.name.toLowerCase().includes('diet') ? 'diet' : 'desi',
      badge: meta.badge || (item.name.toLowerCase().includes('winter') ? 'Winter Menu Special' : 'Weekly Subscription'),
      daysCount: daysCount as 5 | 7,
      price: String(item.price || 4400),
      subtitle: meta.subtitle || (daysCount === 5 ? 'Monday to Friday • Workweek Plan' : 'Monday to Sunday • Full Week Plan'),
      image_url: item.image_url || '/items/beef-nihari.jpg',
      highlights: Array.isArray(meta.highlights)
        ? meta.highlights.join(', ')
        : '100% Halal & Freshly Cooked, Daily Doorstep Delivery, Rich Traditional Flavors, Complete Weekly Feast',
      days: default7.map((d, idx) => existingDays[idx] || d),
    })
    setShowPlanModal(true)
  }

  // Verify Admin Status
  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/admin/orders').then((r) => r.json())
      if (res.error || !res.data) {
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
        setOrders(res.data || [])
      }
    } catch {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    checkAdmin()
  }, [])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      toast.success('Admin Secret Key verified! Unlocking Dashboard...')
      setIsAdmin(true)
      setAdminPassword('')
      loadOrders()
    } catch (err: any) {
      toast.error(err.message || 'Invalid admin secret password')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/auth/admin-logout', { method: 'POST' })
      toast.success('Admin Dashboard session locked')
      setIsAdmin(false)
    } catch {
      toast.error('Error locking admin session')
    }
  }

  // Load Data
  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const url = statusFilter !== 'all' ? `/api/admin/orders?status=${statusFilter}` : '/api/admin/orders'
      const res = await fetch(url).then((r) => r.json())
      if (res.data) setOrders(res.data)
    } catch (e) {
      toast.error('Failed to load orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  const loadMenu = async () => {
    setLoadingMenu(true)
    try {
      const res = await fetch('/api/admin/menu').then((r) => r.json())
      if (res.data) setFoodItems(res.data)
    } catch (e) {
      toast.error('Failed to load menu')
    } finally {
      setLoadingMenu(false)
    }
  }

  const loadDeals = async () => {
    setLoadingDeals(true)
    try {
      const res = await fetch('/api/admin/deals').then((r) => r.json())
      if (res.data) setDeals(res.data)
    } catch (e) {
      toast.error('Failed to load deals')
    } finally {
      setLoadingDeals(false)
    }
  }

  const loadSubscriptions = async () => {
    setLoadingSubscriptions(true)
    try {
      const res = await fetch('/api/admin/subscriptions').then((r) => r.json())
      if (res.data) setSubscriptions(res.data)
    } catch (e) {
      toast.error('Failed to load subscriptions')
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadOrders()
      loadSubscriptions()
      loadMenu()
      if (activeTab === 'deals') loadDeals()
    }
  }, [isAdmin, activeTab, statusFilter])

  // Create Weekly Subscription
  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingSub(true)
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub),
      }).then((r) => r.json())

      if (res.data) {
        toast.success(`Subscribed user "${newSub.user_name}"`)
        setShowSubModal(false)
        setNewSub({
          user_name: '',
          phone: '',
          email: '',
          package_plan: '7-Day Executive Lunch Box (Chicken Karahi & Rice)',
          start_date: new Date().toISOString().split('T')[0],
          notes: '',
        })
        loadSubscriptions()
      } else {
        toast.error(res.error || 'Failed to add subscriber')
      }
    } catch (e) {
      toast.error('Error adding subscriber')
    } finally {
      setSavingSub(false)
    }
  }

  const updateSubscriptionStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/subscriptions?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).then((r) => r.json())

      if (res.data) {
        toast.success(`Subscription marked as ${newStatus.toUpperCase()}`)
        setSubscriptions((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus as any } : s)))
      }
    } catch (e) {
      toast.error('Error updating subscription')
    }
  }

  const deleteSubscription = async (sub: Subscription) => {
    if (!confirm(`Delete subscription for "${sub.user_name}"?`)) return
    try {
      await fetch(`/api/admin/subscriptions?id=${sub.id}`, { method: 'DELETE' })
      toast.success(`Deleted subscription for ${sub.user_name}`)
      setSubscriptions((prev) => prev.filter((s) => s.id !== sub.id))
    } catch {
      toast.error('Failed to delete subscription')
    }
  }

  // Update Order Status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).then((r) => r.json())

      if (res.data) {
        toast.success(`Order status updated to "${newStatus.toUpperCase()}"`)
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o)))
      } else {
        toast.error(res.error || 'Failed to update order')
      }
    } catch (e) {
      toast.error('Error updating order status')
    }
  }

  // Create or Update Food Item in Supabase
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingItem(true)
    try {
      const builtTags: string[] = newItem.customTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => Boolean(t) && !t.includes(':'))

      if (newItem.availabilityMode === 'everyday') {
        builtTags.push('avail:everyday')
      } else {
        const days = newItem.selectedDays.length > 0 ? newItem.selectedDays : ['Monday']
        for (const d of days) {
          builtTags.push(`avail:${d}`)
        }
      }

      if (newItem.specialSlot !== 'none') {
        builtTags.push(`slot:${newItem.specialSlot}`)
      }
      if (newItem.serving_size.trim()) {
        builtTags.push(`serving:${newItem.serving_size.trim()}`)
      }
      if (newItem.ingredients.trim()) {
        const ingList = newItem.ingredients
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join('|')
        if (ingList) builtTags.push(`ing:${ingList}`)
      }
      if (newItem.allergens.trim()) {
        const allgList = newItem.allergens
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join('|')
        if (allgList) builtTags.push(`allg:${allgList}`)
      }
      if (newItem.variants.trim()) {
        const varList = newItem.variants
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join('|')
        if (varList) builtTags.push(`var:${varList}`)
      }

      const payload = {
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        price: parseFloat(newItem.price) || 500,
        calories: parseInt(newItem.calories) || 450,
        protein_g: parseFloat(newItem.protein_g) || 0,
        carbs_g: parseFloat(newItem.carbs_g) || 0,
        fat_g: parseFloat(newItem.fat_g) || 0,
        tags: builtTags,
        category: newItem.category,
        image_url: newItem.image_url || '/items/chicken-karahi.jpg',
        is_featured: newItem.is_featured,
        sort_order: parseInt(newItem.sort_order) || 10,
        status: newItem.status,
      }

      const url = editingItemId ? `/api/admin/menu/${editingItemId}` : '/api/admin/menu'
      const method = editingItemId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json())

      if (res.data) {
        toast.success(
          editingItemId
            ? `Updated "${newItem.name}" in Supabase!`
            : `Created "${newItem.name}" and saved to Supabase!`
        )
        setShowItemModal(false)
        setEditingItemId(null)
        loadMenu()
      } else {
        toast.error(res.error || 'Failed to save menu item')
      }
    } catch (e) {
      toast.error('Error saving menu item')
    } finally {
      setSavingItem(false)
    }
  }

  // Create or Update Weekly Menu Plan in Supabase
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPlan(true)
    try {
      const activeDays = planForm.days.slice(0, planForm.daysCount)
      const highlightsList = planForm.highlights
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const planMeta = {
        category: planForm.category,
        badge: planForm.badge.trim() || 'Weekly Subscription',
        daysCount: planForm.daysCount,
        subtitle: planForm.subtitle.trim() || `${planForm.daysCount}-Day Weekly Meal Plan`,
        highlights: highlightsList,
        days: activeDays,
      }

      const summaryDesc = `${planForm.title} (Rs ${planForm.price}): ${activeDays
        .map((d) => `${d.day.slice(0, 3)} ${d.title}`)
        .join(', ')}.`

      const payload = {
        name: planForm.title.trim(),
        description: summaryDesc,
        price: parseFloat(planForm.price) || 4400,
        calories: planForm.category === 'diet' ? 450 : 620,
        protein_g: 42,
        carbs_g: 48,
        fat_g: 22,
        category: 'subscription',
        image_url: planForm.image_url || '/items/beef-nihari.jpg',
        is_featured: true,
        sort_order: 1,
        status: 'active' as const,
        tags: ['subscription', planForm.category, `plan_meta:${JSON.stringify(planMeta)}`],
      }

      const url = editingPlanId ? `/api/admin/menu/${editingPlanId}` : '/api/admin/menu'
      const method = editingPlanId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json())

      if (res.data) {
        toast.success(
          editingPlanId
            ? `Updated Weekly Menu Plan "${planForm.title}" in Supabase!`
            : `Created Weekly Menu Plan "${planForm.title}" in Supabase!`
        )
        setShowPlanModal(false)
        setEditingPlanId(null)
        loadMenu()
      } else {
        toast.error(res.error || 'Failed to save weekly plan')
      }
    } catch {
      toast.error('Error saving weekly plan')
    } finally {
      setSavingPlan(false)
    }
  }

  // Toggle Food Item Availability (Active vs Inactive / Out of Stock)
  const toggleItemStatus = async (item: FoodItem) => {
    const nextStatus = item.status === 'active' ? 'inactive' : 'active'
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      }).then((r) => r.json())

      if (res.data) {
        toast.success(`"${item.name}" is now ${nextStatus === 'active' ? 'AVAILABLE' : 'NOT AVAILABLE'}`)
        setFoodItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: nextStatus } : f)))
      } else {
        toast.error(res.error || 'Failed to update item availability')
      }
    } catch (e) {
      toast.error('Error updating item availability')
    }
  }

  // Delete Food Item
  const deleteItem = async (item: FoodItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.name}" from the menu?`)) return
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, { method: 'DELETE' }).then((r) => r.json())
      if (res.message) {
        toast.success(`Deleted "${item.name}"`)
        setFoodItems((prev) => prev.filter((f) => f.id !== item.id))
      } else {
        toast.error(res.error || 'Failed to delete item')
      }
    } catch (e) {
      toast.error('Error deleting menu item')
    }
  }

  // Calculated Analytics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total) : sum), 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length
  const confirmedCount = orders.filter((o) => o.status === 'confirmed' || o.status === 'preparing').length
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length

  const activeProductsCount = foodItems.filter((f) => f.status === 'active').length
  const outOfStockCount = foodItems.filter((f) => f.status !== 'active').length

  // Admin Loading Screen
  if (isAdmin === null) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', color: '#C7230F' }} className="min-h-screen pt-32 pb-16 px-4 font-sans flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={36} className="animate-spin text-[#C7230F]" />
          <span className="font-extrabold text-sm tracking-wider uppercase">Verifying Admin Credentials...</span>
        </div>
      </div>
    )
  }

  // Admin Secure Login Screen
  if (isAdmin === false) {
    return (
      <div style={{ backgroundColor: '#FAFAFA', color: '#C7230F' }} className="min-h-screen pt-32 pb-16 px-4 font-sans flex flex-col items-center justify-center">
        <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="rounded-[2.5rem] border-2 p-8 sm:p-12 shadow-2xl max-w-md w-full text-center">
          <div style={{ backgroundColor: '#C7230F', color: '#FFFFFF' }} className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <Lock size={32} style={{ color: '#FFFFFF' }} />
          </div>
          <h1 style={{ color: '#C7230F' }} className="font-serif font-black text-2xl mb-2">Restricted Admin Access</h1>
          <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80 mb-6">Enter the Admin Secret Password from .env.local to access live orders & management</p>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase tracking-wider mb-1">
                Admin Secret Password / Key
              </label>
              <input
                type="password"
                required
                autoFocus
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••••••"
                style={{ backgroundColor: '#FAFAFA', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                className="w-full p-4 rounded-xl border-2 font-mono font-black text-sm outline-none focus:border-[#C7230F]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              style={{ backgroundColor: '#C7230F', color: '#FFFFFF' }}
              className="mt-2 w-full py-4 rounded-full font-black text-sm uppercase tracking-wider shadow-lg hover:bg-[#A31C0C] cursor-pointer border-none transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              <span>{loggingIn ? 'Authenticating...' : 'Unlock Admin Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FAFAFA', color: '#C7230F' }} className="min-h-screen pt-28 pb-16 px-4 sm:px-8 font-sans">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div style={{ backgroundColor: '#C7230F', color: '#FFFFFF' }} className="inline-flex items-center gap-1.5 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
              <Sparkles size={13} style={{ color: '#FFFFFF' }} />
              <span>CAMO'S FOODS MANAGEMENT</span>
            </div>
            <h1 style={{ color: '#C7230F' }} className="font-serif font-black text-3xl sm:text-4xl">
              Admin Control Center
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                if (activeTab === 'orders') loadOrders()
                if (activeTab === 'menu' || activeTab === 'deals') loadMenu()
                if (activeTab === 'subscriptions') loadSubscriptions()
              }}
              style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.3)', color: '#C7230F' }}
              className="p-3 rounded-2xl border-2 font-bold text-xs flex items-center gap-2 cursor-pointer hover:border-[#C7230F]"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleAdminLogout}
              style={{ backgroundColor: '#FFFFFF', borderColor: '#C7230F', color: '#C7230F' }}
              className="px-4 py-3 rounded-2xl border-2 font-extrabold text-xs flex items-center gap-2 cursor-pointer hover:bg-[#FFFFEF] transition-all uppercase tracking-wider"
            >
              <LogOut size={16} />
              <span>Lock</span>
            </button>

            <button
              onClick={openAddPlanModal}
              style={{ backgroundColor: '#FFFFFF', borderColor: '#C7230F', color: '#C7230F' }}
              className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 cursor-pointer hover:bg-[#FFFFEF]"
            >
              <Calendar size={16} style={{ color: '#C7230F' }} />
              <span>+ Add Weekly Menu Plan</span>
            </button>

            <button
              onClick={openAddProductModal}
              style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
              className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-[#A31C0C] cursor-pointer border-none"
            >
              <Plus size={16} style={{ color: '#FFFFEF' }} />
              <span>+ Add Food Product</span>
            </button>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-5 rounded-3xl border-2 shadow-xs flex items-center gap-4">
            <div style={{ backgroundColor: 'rgba(199,35,15,0.1)', color: '#C7230F' }} className="w-12 h-12 rounded-2xl flex items-center justify-center font-black">
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ color: '#C7230F' }} className="text-xs font-bold uppercase tracking-wider opacity-70">Total Revenue</div>
              <div style={{ color: '#C7230F' }} className="font-serif font-black text-xl">PKR {totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-5 rounded-3xl border-2 shadow-xs flex items-center gap-4">
            <div style={{ backgroundColor: 'rgba(199,35,15,0.1)', color: '#C7230F' }} className="w-12 h-12 rounded-2xl flex items-center justify-center font-black">
              <ShoppingBag size={24} />
            </div>
            <div>
              <div style={{ color: '#C7230F' }} className="text-xs font-bold uppercase tracking-wider opacity-70">Total Orders</div>
              <div style={{ color: '#C7230F' }} className="font-serif font-black text-xl">{orders.length}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-5 rounded-3xl border-2 shadow-xs flex items-center gap-4">
            <div style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }} className="w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-sm">
              <Calendar size={24} style={{ color: '#FFFFEF' }} />
            </div>
            <div>
              <div style={{ color: '#C7230F' }} className="text-xs font-bold uppercase tracking-wider opacity-70">Weekly Subscribers</div>
              <div style={{ color: '#C7230F' }} className="font-serif font-black text-xl">{subscriptions.length} Active</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-5 rounded-3xl border-2 shadow-xs flex items-center gap-4">
            <div style={{ backgroundColor: 'rgba(199,35,15,0.1)', color: '#C7230F' }} className="w-12 h-12 rounded-2xl flex items-center justify-center font-black">
              <CheckCircle size={24} />
            </div>
            <div>
              <div style={{ color: '#C7230F' }} className="text-xs font-bold uppercase tracking-wider opacity-70">Delivered Orders</div>
              <div style={{ color: '#C7230F' }} className="font-serif font-black text-xl">{deliveredCount}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#C7230F]/20 mb-8 gap-4 overflow-x-auto">
          {[
            { id: 'orders', label: `Live Orders (${orders.length})`, icon: <ShoppingBag size={16} /> },
            { id: 'menu', label: `Menu Products (${foodItems.filter((f) => f.category !== 'subscription' && !f.name.toLowerCase().includes('plan')).length})`, icon: <Package size={16} /> },
            { id: 'deals', label: `Weekly Menus & Plans (${foodItems.filter((f) => f.category === 'subscription' || f.name.toLowerCase().includes('plan')).length})`, icon: <Tag size={16} /> },
            { id: 'subscriptions', label: `Subscribers (${subscriptions.length})`, icon: <Calendar size={16} /> },
            { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              style={{
                color: activeTab === id ? '#C7230F' : '#C7230F',
                borderBottomColor: activeTab === id ? '#C7230F' : 'transparent',
                fontWeight: activeTab === id ? 900 : 700,
              }}
              className={`pb-4 px-3 border-b-4 text-sm flex items-center gap-2 cursor-pointer no-underline whitespace-nowrap transition-all ${
                activeTab === id ? 'opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['all', 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      backgroundColor: statusFilter === st ? '#C7230F' : '#FFFFFF',
                      color: statusFilter === st ? '#FFFFEF' : '#C7230F',
                      borderColor: 'rgba(199,35,15,0.3)',
                    }}
                    className="px-4 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider cursor-pointer transition-all shrink-0"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-[#C7230F]/10" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.2)' }} className="rounded-3xl p-12 border text-center font-bold text-sm">
                No orders match status "{statusFilter.toUpperCase()}"
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }}
                    className="rounded-3xl p-6 border-2 shadow-sm hover:border-[#C7230F] transition-all"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#C7230F]/15 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: '#C7230F' }} className="font-mono font-black text-base">
                            #{o.id.slice(0, 8)}
                          </span>
                          <span style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }} className="font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                            PKR {o.total}
                          </span>
                          {(o.subtotal === 3550 || o.subtotal === 5250 || o.subtotal === 2800 || o.subtotal === 3750 || o.subtotal === 3900 || o.subtotal === 4400 || o.order_items?.some(it => it.name_at_order?.toLowerCase().includes('plan') || it.name_at_order?.toLowerCase().includes('package'))) && (
                            <span style={{ backgroundColor: '#15803D', color: '#FFFFEF' }} className="font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              WEEKLY SUBSCRIPTION
                            </span>
                          )}
                        </div>
                        <span style={{ color: '#C7230F' }} className="text-xs font-bold opacity-70">
                          {new Date(o.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            backgroundColor:
                              o.status === 'delivered' ? '#ECFDF5' : o.status === 'pending' ? '#FEF2F2' : '#FFFBEB',
                            color: o.status === 'delivered' ? '#047857' : o.status === 'pending' ? '#C7230F' : '#B45309',
                            borderColor: o.status === 'delivered' ? '#A7F3D0' : '#FECACA',
                          }}
                          className="px-3 py-1 rounded-lg border font-black text-xs uppercase tracking-wider"
                        >
                          STATUS: {o.status}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div style={{ backgroundColor: '#FFFFEF', borderColor: 'rgba(199,35,15,0.15)' }} className="p-4 rounded-2xl border">
                        <div style={{ color: '#C7230F' }} className="font-black text-xs uppercase tracking-wider mb-2">Customer Info</div>
                        <div style={{ color: '#C7230F' }} className="font-extrabold text-sm mb-1">{o.customers?.name || 'Customer'}</div>
                        <div style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80 flex items-center gap-2">
                          <Phone size={14} />
                          <span>{o.customers?.phone || 'No phone provided'}</span>
                        </div>
                        <div style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80 mt-1">{o.customers?.email}</div>
                      </div>

                      <div style={{ backgroundColor: '#FFFFEF', borderColor: 'rgba(199,35,15,0.15)' }} className="p-4 rounded-2xl border">
                        <div style={{ color: '#C7230F' }} className="font-black text-xs uppercase tracking-wider mb-2">Delivery & Payment Notes</div>
                        <div style={{ color: '#C7230F' }} className="text-xs font-bold flex items-start gap-2 mb-2">
                          <MapPin size={16} className="shrink-0 mt-0.5" />
                          <span>{o.delivery_address || 'Address missing'}</span>
                        </div>
                        {o.notes && (
                          <div style={{ color: '#C7230F', backgroundColor: 'rgba(199,35,15,0.08)' }} className="p-2.5 rounded-xl text-xs font-mono font-black mt-2">
                            {o.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="mb-4">
                      <div style={{ color: '#C7230F' }} className="font-black text-xs uppercase tracking-wider mb-2">Items Ordered</div>
                      <div className="flex flex-col gap-2">
                        {(!o.order_items || o.order_items.length === 0) ? (
                          <div style={{ backgroundColor: '#FFFFEF' }} className="p-3 rounded-xl flex justify-between items-center text-xs font-bold">
                            <span style={{ color: '#C7230F' }}>
                              1x {o.subtotal === 3550 ? '5-Day Diet Plan' : o.subtotal === 5250 ? '7-Day Diet Plan' : o.subtotal === 2800 ? '5-Day Desi Plan' : o.subtotal === 3750 ? '7-Day Desi Plan (Chicken Qeema)' : o.subtotal === 3900 ? '7-Day Desi Plan (Beef Qeema)' : o.subtotal === 4400 ? '7-Day Winter Desi Plan' : 'Gourmet Meal Item'}
                            </span>
                            <span style={{ color: '#C7230F' }} className="font-black">
                              PKR {o.total}
                            </span>
                          </div>
                        ) : (
                          o.order_items.map((it, idx) => (
                            <div key={idx} style={{ backgroundColor: '#FFFFEF' }} className="p-3 rounded-xl flex justify-between items-center text-xs font-bold">
                              <span style={{ color: '#C7230F' }}>
                                {it.quantity}x {it.name_at_order || it.food_items?.name || 'Food Item'}
                              </span>
                              <span style={{ color: '#C7230F' }} className="font-black">
                                PKR {(it.price_at_order || o.total) * it.quantity}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quick Status Change Buttons */}
                    <div className="pt-4 border-t border-[#C7230F]/15 flex flex-wrap gap-2 items-center justify-end">
                      <span style={{ color: '#C7230F' }} className="text-xs font-black uppercase tracking-wider mr-2">Update Status:</span>
                      {['confirmed', 'preparing', 'delivered', 'cancelled'].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateOrderStatus(o.id, st)}
                          disabled={o.status === st}
                          style={{
                            backgroundColor: o.status === st ? '#C7230F' : '#FFFFEF',
                            color: o.status === st ? '#FFFFEF' : '#C7230F',
                            borderColor: '#C7230F',
                          }}
                          className="px-3.5 py-1.5 rounded-xl border font-black text-[11px] uppercase tracking-wider cursor-pointer hover:bg-[#C7230F] hover:text-[#FFFFEF] transition-all disabled:opacity-40"
                        >
                          Mark {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MENU TAB (INDIVIDUAL FOOD PRODUCTS) */}
        {activeTab === 'menu' && (
          <div>
            {/* Products Summary Bar */}
            <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-4 sm:p-6 rounded-3xl border-2 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-xl mb-1">
                  Full Menu Catalog ({foodItems.filter((f) => f.category !== 'subscription' && !f.name.toLowerCase().includes('plan')).length} Dishes)
                </h2>
                <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80">
                  Add new dishes, edit prices, upload photos, set daily or specific-day availability, and save automatically to Supabase.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={openAddProductModal}
                  style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                  className="px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:bg-[#A31C0C] cursor-pointer border-none"
                >
                  <Plus size={14} />
                  <span>Add New Dish</span>
                </button>
                <span style={{ backgroundColor: '#047857', color: '#FFFFEF' }} className="font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  {activeProductsCount} Active
                </span>
                <span style={{ backgroundColor: '#DC2626', color: '#FFFFEF' }} className="font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  {outOfStockCount} Inactive
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems
                .filter((item) => item.category !== 'subscription' && !item.name.toLowerCase().includes('plan'))
                .map((item) => {
                  const isAvailable = item.status === 'active'
                  const rawTags = Array.isArray(item.tags) ? item.tags : []
                  const availDays = rawTags
                    .filter((t) => t.toLowerCase().startsWith('avail:') && t.toLowerCase() !== 'avail:everyday')
                    .map((t) => t.slice(6))
                  const isEveryday =
                    rawTags.some((t) => t.toLowerCase() === 'avail:everyday') ||
                    item.category === 'breakfast' ||
                    item.name.toLowerCase().includes('soup')

                  return (
                    <div
                      key={item.id}
                      style={{ backgroundColor: '#FFFFFF', borderColor: isAvailable ? 'rgba(199,35,15,0.25)' : 'rgba(220,38,38,0.4)' }}
                      className="rounded-3xl p-5 border-2 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex gap-3 items-start mb-3">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-16 h-16 rounded-2xl object-cover border border-[#C7230F]/20 shrink-0 bg-[#FFFFEF]"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center gap-1 flex-wrap mb-1">
                              <span style={{ backgroundColor: 'rgba(199,35,15,0.1)', color: '#C7230F' }} className="font-black text-[10px] px-2 py-0.5 rounded-md uppercase">
                                {item.category || 'Main'}
                              </span>
                              <span
                                style={{
                                  backgroundColor: isAvailable ? '#047857' : '#DC2626',
                                  color: '#FFFFEF',
                                }}
                                className="font-black text-[10px] px-2 py-0.5 rounded-md uppercase"
                              >
                                {isAvailable ? 'ACTIVE' : 'HIDDEN'}
                              </span>
                            </div>
                            <h3 style={{ color: '#C7230F' }} className="font-black text-base leading-snug truncate">{item.name}</h3>
                            <div className="text-[11px] font-extrabold text-[#C7230F]/80 mt-0.5">
                              {availDays.length > 0
                                ? `Schedule: ${availDays.join(', ')}`
                                : isEveryday
                                ? 'Schedule: Available Everyday'
                                : 'Schedule: Weekly Rotation'}
                            </div>
                          </div>
                        </div>
                        <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-75 leading-relaxed mb-4 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="pt-3 border-t border-[#C7230F]/15 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs">
                          <span style={{ color: '#C7230F' }} className="font-black text-base">PKR {item.price}</span>
                          <span style={{ color: '#C7230F' }} className="font-bold opacity-75">
                            {item.calories} kcal • {item.protein_g || 30}g Protein
                          </span>
                        </div>

                        {/* Admin Product Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(item)}
                            style={{
                              backgroundColor: '#C7230F',
                              color: '#FFFFEF',
                            }}
                            className="flex-1 py-2 px-3 rounded-xl border-none font-black text-xs uppercase tracking-wider cursor-pointer transition-all hover:bg-[#A31C0C] flex items-center justify-center gap-1.5"
                          >
                            <Edit size={13} />
                            <span>Edit Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleItemStatus(item)}
                            style={{
                              backgroundColor: isAvailable ? 'rgba(220,38,38,0.1)' : '#047857',
                              color: isAvailable ? '#DC2626' : '#FFFFEF',
                              borderColor: isAvailable ? 'rgba(220,38,38,0.3)' : '#047857',
                            }}
                            className="py-2 px-3 rounded-xl border font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
                          >
                            {isAvailable ? 'Disable' : 'Enable'}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteItem(item)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* WEEKLY SUBSCRIPTIONS TAB */}
        {activeTab === 'subscriptions' && (
          <div>
            <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-4 sm:p-6 rounded-3xl border-2 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-xl mb-1">
                  Weekly Package Subscribers ({subscriptions.length})
                </h2>
                <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80">
                  Track recurring meal subscribers, active packages, start dates, and status.
                </p>
              </div>

              <button
                onClick={() => setShowSubModal(true)}
                style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                className="px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-[#A31C0C] cursor-pointer border-none"
              >
                <Plus size={16} style={{ color: '#FFFFEF' }} />
                <span>Add New Subscriber</span>
              </button>
            </div>

            {loadingSubscriptions ? (
              <div className="flex flex-col gap-4">
                {[1, 2].map((n) => (
                  <div key={n} className="h-24 bg-white rounded-3xl animate-pulse border border-[#C7230F]/10" />
                ))}
              </div>
            ) : subscriptions.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.2)' }} className="rounded-3xl p-12 border text-center font-bold text-sm">
                No active weekly subscriptions found. Click "Add New Subscriber" above to create one!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions.map((s) => (
                  <div
                    key={s.id}
                    style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }}
                    className="rounded-3xl p-6 border-2 shadow-xs hover:border-[#C7230F] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3 pb-3 border-b border-[#C7230F]/15">
                        <div className="flex items-center gap-2.5">
                          <div style={{ backgroundColor: 'rgba(199,35,15,0.1)', color: '#C7230F' }} className="w-10 h-10 rounded-2xl flex items-center justify-center font-black">
                            <UserCheck size={20} />
                          </div>
                          <div>
                            <h3 style={{ color: '#C7230F' }} className="font-black text-base leading-snug">{s.user_name}</h3>
                            <span style={{ color: '#C7230F' }} className="text-xs font-bold opacity-75">{s.phone}</span>
                          </div>
                        </div>

                        <span
                          style={{
                            backgroundColor: s.status === 'active' ? '#047857' : s.status === 'paused' ? '#D97706' : '#DC2626',
                            color: '#FFFFEF',
                          }}
                          className="font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider"
                        >
                          {s.status}
                        </span>
                      </div>

                      <div style={{ backgroundColor: '#FFFFEF', borderColor: 'rgba(199,35,15,0.15)' }} className="p-3.5 rounded-2xl border mb-3">
                        <div style={{ color: '#C7230F' }} className="text-[10px] font-black uppercase tracking-wider mb-1">Subscribed Package Plan</div>
                        <div style={{ color: '#C7230F' }} className="font-extrabold text-xs">{s.package_plan}</div>
                      </div>

                      {s.notes && (
                        <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80 mb-4 italic">
                          "{s.notes}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#C7230F]/15 flex items-center justify-between">
                      <span style={{ color: '#C7230F' }} className="text-[11px] font-bold opacity-75">
                        Start Date: <strong>{s.start_date || 'Ongoing'}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {s.status !== 'active' && (
                          <button
                            onClick={() => updateSubscriptionStatus(s.id, 'active')}
                            className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-black cursor-pointer"
                          >
                            Activate
                          </button>
                        )}
                        {s.status === 'active' && (
                          <button
                            onClick={() => updateSubscriptionStatus(s.id, 'paused')}
                            className="px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black cursor-pointer"
                          >
                            Pause
                          </button>
                        )}
                        <button
                          onClick={() => deleteSubscription(s)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                          title="Delete Subscription"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW / DASHBOARD TAB */}
        {activeTab === 'overview' && (
          <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.2)' }} className="rounded-3xl p-8 border-2 shadow-sm">
            <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-2xl mb-4">Kitchen Performance Summary</h2>
            <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80 mb-6">
              Real-time monitoring of active orders, customer subscriptions, and menu updates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div style={{ backgroundColor: '#FFFFEF' }} className="p-6 rounded-2xl border border-[#C7230F]/20">
                <div style={{ color: '#C7230F' }} className="text-3xl font-black mb-1">{pendingCount}</div>
                <div style={{ color: '#C7230F' }} className="text-xs font-bold uppercase tracking-wider">Pending Orders</div>
              </div>
              <div style={{ backgroundColor: '#FFFFEF' }} className="p-6 rounded-2xl border border-[#C7230F]/20">
                <div style={{ color: '#C7230F' }} className="text-3xl font-black mb-1">{confirmedCount}</div>
                <div style={{ color: '#C7230F' }} className="text-xs font-bold uppercase tracking-wider">In Preparation</div>
              </div>
              <div style={{ backgroundColor: '#FFFFEF' }} className="p-6 rounded-2xl border border-[#C7230F]/20">
                <div style={{ color: '#C7230F' }} className="text-3xl font-black mb-1">{deliveredCount}</div>
                <div style={{ color: '#C7230F' }} className="text-xs font-bold uppercase tracking-wider">Completed Orders</div>
              </div>
            </div>
          </div>
        )}

        {/* WEEKLY MENUS & PLANS TAB */}
        {activeTab === 'deals' && (
          <div>
            <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-4 sm:p-6 rounded-3xl border-2 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-xl mb-1">
                  Weekly Menus & Subscription Plans ({foodItems.filter((f) => f.category === 'subscription' || f.name.toLowerCase().includes('plan')).length})
                </h2>
                <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80">
                  Create new 5-day or 7-day weekly meal plans, customize day-by-day dishes and prices, and sync directly to Supabase & the live Deals page.
                </p>
              </div>

              <button
                onClick={openAddPlanModal}
                style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-[#A31C0C] cursor-pointer border-none"
              >
                <Plus size={16} style={{ color: '#FFFFEF' }} />
                <span>Create New Weekly Menu Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems
                .filter((item) => item.category === 'subscription' || item.name.toLowerCase().includes('plan'))
                .map((plan) => {
                  const isAvailable = plan.status === 'active'
                  const rawTags = Array.isArray(plan.tags) ? plan.tags : []
                  const metaTag = rawTags.find((t) => t.startsWith('plan_meta:'))
                  let meta: any = null
                  if (metaTag) {
                    try {
                      meta = JSON.parse(metaTag.slice(10))
                    } catch {}
                  }

                  return (
                    <div
                      key={plan.id}
                      style={{ backgroundColor: '#FFFFFF', borderColor: isAvailable ? 'rgba(199,35,15,0.25)' : 'rgba(220,38,38,0.4)' }}
                      className="rounded-3xl p-6 border-2 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }} className="font-black text-[10px] px-3 py-1 rounded-full uppercase">
                            {meta?.badge || 'Weekly Plan'}
                          </span>
                          <span
                            style={{
                              backgroundColor: isAvailable ? '#047857' : '#DC2626',
                              color: '#FFFFEF',
                            }}
                            className="font-black text-[10px] px-2.5 py-1 rounded-md uppercase"
                          >
                            {isAvailable ? 'ACTIVE ON SITE' : 'HIDDEN'}
                          </span>
                        </div>

                        <h3 style={{ color: '#C7230F' }} className="font-black text-xl mb-1">{plan.name}</h3>
                        <div style={{ color: '#C7230F' }} className="font-black text-2xl mb-2">PKR {plan.price.toLocaleString()}</div>
                        <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-75 leading-relaxed mb-4">
                          {plan.description || meta?.subtitle || 'Official Weekly Meal Plan'}
                        </p>

                        {meta?.days && Array.isArray(meta.days) && (
                          <div className="bg-[#FFFFEF] border border-[#C7230F]/20 rounded-2xl p-3 mb-4 space-y-1">
                            {meta.days.map((d: any) => (
                              <div key={d.day} className="text-[11px] font-bold text-[#C7230F] flex justify-between gap-2">
                                <span className="font-black uppercase">{d.day.slice(0, 3)}:</span>
                                <span className="truncate">{d.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-[#C7230F]/15 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditPlanModal(plan)}
                          style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                          className="flex-1 py-2.5 px-3 rounded-xl border-none font-black text-xs uppercase tracking-wider cursor-pointer hover:bg-[#A31C0C] flex items-center justify-center gap-1.5"
                        >
                          <Edit size={13} />
                          <span>Edit Schedule & Price</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleItemStatus(plan)}
                          style={{
                            backgroundColor: isAvailable ? 'rgba(220,38,38,0.1)' : '#047857',
                            color: isAvailable ? '#DC2626' : '#FFFFEF',
                            borderColor: isAvailable ? 'rgba(220,38,38,0.3)' : '#047857',
                          }}
                          className="py-2.5 px-3 rounded-xl border font-black text-xs uppercase cursor-pointer"
                        >
                          {isAvailable ? 'Hide' : 'Show'}
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(plan)}
                          className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                          title="Delete Plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* ADD WEEKLY SUBSCRIBER MODAL */}
        {showSubModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div style={{ backgroundColor: '#FFFFEF', borderColor: '#C7230F' }} className="rounded-[2.5rem] border-2 p-8 max-w-lg w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-2xl">Add Weekly Subscriber</h2>
                <button onClick={() => setShowSubModal(false)} className="bg-transparent border-none cursor-pointer p-1">
                  <X size={20} style={{ color: '#C7230F' }} />
                </button>
              </div>

              <form onSubmit={handleCreateSubscription} className="flex flex-col gap-4">
                <div>
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Subscriber Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newSub.user_name}
                    onChange={(e) => setNewSub({ ...newSub, user_name: e.target.value })}
                    placeholder="e.g. Usman Chaudhry"
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                    className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={newSub.phone}
                      onChange={(e) => setNewSub({ ...newSub, phone: e.target.value })}
                      placeholder="0328 5286882"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      value={newSub.email}
                      onChange={(e) => setNewSub({ ...newSub, email: e.target.value })}
                      placeholder="user@gmail.com"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Package Plan Subscribed *</label>
                  <input
                    type="text"
                    required
                    value={newSub.package_plan}
                    onChange={(e) => setNewSub({ ...newSub, package_plan: e.target.value })}
                    placeholder="e.g. 7-Day Winter Desi Plan"
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                    className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                  />
                </div>

                <div>
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Special Preferences / Notes</label>
                  <textarea
                    rows={2}
                    value={newSub.notes}
                    onChange={(e) => setNewSub({ ...newSub, notes: e.target.value })}
                    placeholder="e.g. Less spicy, deliver by 1:00 PM daily..."
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                    className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowSubModal(false)}
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: '#C7230F' }}
                    className="flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-wider border-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingSub}
                    style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                    className="flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-wider border-none cursor-pointer shadow-md hover:bg-[#A31C0C]"
                  >
                    {savingSub ? 'Saving Subscriber...' : 'Save Subscriber'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COMPREHENSIVE ADD / EDIT PRODUCT MODAL (SAVES TO SUPABASE) */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
            <div
              style={{ backgroundColor: '#FFFFEF', borderColor: '#C7230F' }}
              className="rounded-[2.5rem] border-2 p-6 sm:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#C7230F]/20">
                <div>
                  <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-2xl">
                    {editingItemId ? 'Edit Product Details' : 'Add New Product to Menu'}
                  </h2>
                  <p className="text-xs font-bold text-[#C7230F]/75">
                    Every field below is saved directly to your live Supabase database.
                  </p>
                </div>
                <button onClick={() => setShowItemModal(false)} className="bg-transparent border-none cursor-pointer p-1">
                  <X size={22} style={{ color: '#C7230F' }} />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="flex flex-col gap-5">
                {/* Row 1: Name, Category, Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Dish / Product Name *</label>
                    <input
                      type="text"
                      required
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g. Chicken Corn Soup"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Category *</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none cursor-pointer"
                    >
                      <option value="main">Main Course</option>
                      <option value="rice">Rice & Biryani</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="starter">Starter / Soup</option>
                      <option value="bowl">Bowls</option>
                      <option value="wrap">Wraps</option>
                      <option value="tacos">Tacos</option>
                      <option value="pasta">Pasta</option>
                      <option value="burger">Burgers</option>
                      <option value="salad">Salads</option>
                      <option value="snack">Snacks</option>
                      <option value="dessert">Desserts</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="500"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Availability Schedule Selector (Everyday vs Specific Days) */}
                <div className="bg-white p-4 rounded-2xl border-2 border-[#C7230F]/25">
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-2">
                    Availability Schedule (When Can Customers Order This Dish?) *
                  </label>
                  <div className="flex flex-wrap gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, availabilityMode: 'everyday' })}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase cursor-pointer border-2 transition-all ${
                        newItem.availabilityMode === 'everyday'
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                          : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/30'
                      }`}
                    >
                      ✓ Available Everyday (Like Breakfast & Soup)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItem({ ...newItem, availabilityMode: 'specific_days' })}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase cursor-pointer border-2 transition-all ${
                        newItem.availabilityMode === 'specific_days'
                          ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                          : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/30'
                      }`}
                    >
                      📅 Available on Specific Day(s) Only
                    </button>
                  </div>

                  {newItem.availabilityMode === 'specific_days' && (
                    <div className="pt-2 border-t border-[#C7230F]/15">
                      <div className="text-[11px] font-bold text-[#C7230F] mb-2">Select Day(s) of the Week:</div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {DAYS_OF_WEEK.map((day) => {
                          const selected = newItem.selectedDays.includes(day)
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const next = selected
                                  ? newItem.selectedDays.filter((d) => d !== day)
                                  : [...newItem.selectedDays, day]
                                setNewItem({ ...newItem, selectedDays: next.length > 0 ? next : [day] })
                              }}
                              className={`px-3 py-1.5 rounded-lg font-black text-xs cursor-pointer border transition-all ${
                                selected
                                  ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                                  : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/30'
                              }`}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>

                      <div className="text-[11px] font-bold text-[#C7230F] mb-1.5">Daily Special Badge Type:</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'none', label: 'Standard Scheduled Dish' },
                          { id: 'desi', label: "Today's Desi Special" },
                          { id: 'diet', label: "Today's Diet Special" },
                          { id: 'winter', label: "Today's Winter Special" },
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setNewItem({ ...newItem, specialSlot: s.id as any })}
                            className={`px-3 py-1.5 rounded-lg font-black text-[11px] cursor-pointer border ${
                              newItem.specialSlot === s.id
                                ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                                : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/30'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 3: Image Upload, Image URL & Preset Gallery */}
                <div className="bg-white p-4 rounded-2xl border-2 border-[#C7230F]/25">
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-2">
                    Product Image (Upload Photo, Paste URL, or Pick Studio Photo) *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-3">
                    <img
                      src={newItem.image_url || '/items/chicken-karahi.jpg'}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#C7230F] shrink-0 bg-[#FFFFEF]"
                    />
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <label
                          style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                          className="px-4 py-2 rounded-xl font-black text-xs uppercase cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Upload Image File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageFileUpload(e, (dataUrl) => setNewItem({ ...newItem, image_url: dataUrl }))
                            }
                          />
                        </label>
                        <input
                          type="text"
                          value={newItem.image_url}
                          onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                          placeholder="Or paste image URL (/items/... or https://...)"
                          style={{ backgroundColor: '#FFFFEF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                          className="flex-1 min-w-[200px] p-2 rounded-xl border font-bold text-xs outline-none"
                        />
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {PRESET_IMAGES.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setNewItem({ ...newItem, image_url: p.url })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 cursor-pointer border ${
                              newItem.image_url === p.url
                                ? 'bg-[#C7230F] text-[#FFFFEF] border-[#C7230F]'
                                : 'bg-[#FFFFEF] text-[#C7230F] border-[#C7230F]/25'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 4: Full Description */}
                <div>
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Full Product Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Describe the flavors, preparation, and sides included..."
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                    className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none"
                  />
                </div>

                {/* Row 5: Nutrition & Macros */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      value={newItem.calories}
                      onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Protein (g)</label>
                    <input
                      type="number"
                      value={newItem.protein_g}
                      onChange={(e) => setNewItem({ ...newItem, protein_g: e.target.value })}
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      value={newItem.carbs_g}
                      onChange={(e) => setNewItem({ ...newItem, carbs_g: e.target.value })}
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Fat (g)</label>
                    <input
                      type="number"
                      value={newItem.fat_g}
                      onChange={(e) => setNewItem({ ...newItem, fat_g: e.target.value })}
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Row 6: Product Page Details (Serving Size, Variants, Ingredients, Allergens, Tags) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Serving Size</label>
                    <input
                      type="text"
                      value={newItem.serving_size}
                      onChange={(e) => setNewItem({ ...newItem, serving_size: e.target.value })}
                      placeholder="1 Serving (approx. 400g)"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Variants / Options (Comma-Separated)</label>
                    <input
                      type="text"
                      value={newItem.variants}
                      onChange={(e) => setNewItem({ ...newItem, variants: e.target.value })}
                      placeholder="e.g. Regular, Large (leave empty if none)"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Key Ingredients (Comma-Separated)</label>
                    <input
                      type="text"
                      value={newItem.ingredients}
                      onChange={(e) => setNewItem({ ...newItem, ingredients: e.target.value })}
                      placeholder="Halal Chicken, Basmati Rice, Fresh Herbs..."
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Allergens / Dietary Note</label>
                    <input
                      type="text"
                      value={newItem.allergens}
                      onChange={(e) => setNewItem({ ...newItem, allergens: e.target.value })}
                      placeholder="100% Halal (Nut-Free), Dairy..."
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Row 7: Tags, Featured, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2">
                    <label style={{ color: '#C7230F' }} className="block text-[11px] font-black uppercase mb-1">Search & Badge Tags (Comma-Separated)</label>
                    <input
                      type="text"
                      value={newItem.customTags}
                      onChange={(e) => setNewItem({ ...newItem, customTags: e.target.value })}
                      placeholder="halal, high-protein, bestseller, popular"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 text-xs font-black text-[#C7230F] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newItem.is_featured}
                        onChange={(e) => setNewItem({ ...newItem, is_featured: e.target.checked })}
                      />
                      <span>Featured on Home</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-2 pt-4 border-t border-[#C7230F]/20">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: '#C7230F' }}
                    className="flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-wider border-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingItem}
                    style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                    className="flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-wider border-none cursor-pointer shadow-md hover:bg-[#A31C0C]"
                  >
                    {savingItem
                      ? 'Saving to Supabase...'
                      : editingItemId
                      ? 'Update Product in Supabase'
                      : 'Save New Product to Supabase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WEEKLY MENU PLAN BUILDER MODAL (SAVES TO SUPABASE) */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
            <div
              style={{ backgroundColor: '#FFFFEF', borderColor: '#C7230F' }}
              className="rounded-[2.5rem] border-2 p-6 sm:p-8 max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#C7230F]/20">
                <div>
                  <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-2xl">
                    {editingPlanId ? 'Edit Weekly Menu Plan' : 'Create New Weekly Menu Plan'}
                  </h2>
                  <p className="text-xs font-bold text-[#C7230F]/75">
                    Configure the plan price, duration, highlights, and day-by-day meals — saved directly to Supabase.
                  </p>
                </div>
                <button onClick={() => setShowPlanModal(false)} className="bg-transparent border-none cursor-pointer p-1">
                  <X size={22} style={{ color: '#C7230F' }} />
                </button>
              </div>

              <form onSubmit={handleSavePlan} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Weekly Plan Title *</label>
                    <input
                      type="text"
                      required
                      value={planForm.title}
                      onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                      placeholder="e.g. 7-Day Winter Desi Plan"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Total Price (PKR) *</label>
                    <input
                      type="number"
                      required
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                      placeholder="4400"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Plan Type</label>
                    <select
                      value={planForm.category}
                      onChange={(e) => setPlanForm({ ...planForm, category: e.target.value as 'desi' | 'diet' })}
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value="desi">Desi / Winter Menu Plan</option>
                      <option value="diet">High-Protein Diet Plan</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Duration (Days)</label>
                    <select
                      value={planForm.daysCount}
                      onChange={(e) => setPlanForm({ ...planForm, daysCount: Number(e.target.value) as 5 | 7 })}
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value={7}>7 Days (Monday – Sunday)</option>
                      <option value={5}>5 Days (Monday – Friday)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Badge Label</label>
                    <input
                      type="text"
                      value={planForm.badge}
                      onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                      placeholder="Winter Menu Special"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={planForm.subtitle}
                      onChange={(e) => setPlanForm({ ...planForm, subtitle: e.target.value })}
                      placeholder="Monday to Sunday • Full Week Plan"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Card Highlights (Comma-Separated)</label>
                    <input
                      type="text"
                      value={planForm.highlights}
                      onChange={(e) => setPlanForm({ ...planForm, highlights: e.target.value })}
                      placeholder="Chicken Karahi & Kofta Curry, Sunday Beef Nihari..."
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-2.5 rounded-xl border-2 font-bold text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Day-by-Day Schedule Builder */}
                <div className="bg-white p-4 rounded-2xl border-2 border-[#C7230F]/25">
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-3">
                    Day-by-Day Cooking Schedule ({planForm.daysCount} Days)
                  </label>
                  <div className="space-y-3">
                    {planForm.days.slice(0, planForm.daysCount).map((d, idx) => (
                      <div key={d.day} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#FFFFEF] p-2.5 rounded-xl border border-[#C7230F]/20">
                        <div className="sm:col-span-2">
                          <span className="inline-block bg-[#C7230F] text-[#FFFFEF] font-black text-[10px] px-2.5 py-1 rounded-md uppercase">
                            {d.day}
                          </span>
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            required
                            value={d.title}
                            onChange={(e) => {
                              const next = [...planForm.days]
                              next[idx] = { ...next[idx], title: e.target.value }
                              setPlanForm({ ...planForm, days: next })
                            }}
                            placeholder={`${d.day} Dish Name`}
                            className="w-full p-2 rounded-lg border border-[#C7230F]/30 bg-white text-xs font-black text-[#C7230F] outline-none"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={d.desc}
                            onChange={(e) => {
                              const next = [...planForm.days]
                              next[idx] = { ...next[idx], desc: e.target.value }
                              setPlanForm({ ...planForm, days: next })
                            }}
                            placeholder="Short description..."
                            className="w-full p-2 rounded-lg border border-[#C7230F]/30 bg-white text-xs font-semibold text-[#C7230F] outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={d.tag || ''}
                            onChange={(e) => {
                              const next = [...planForm.days]
                              next[idx] = { ...next[idx], tag: e.target.value }
                              setPlanForm({ ...planForm, days: next })
                            }}
                            placeholder="Tag"
                            className="w-full p-2 rounded-lg border border-[#C7230F]/30 bg-white text-[11px] font-bold text-[#C7230F] outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-2 pt-4 border-t border-[#C7230F]/20">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: '#C7230F' }}
                    className="flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-wider border-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPlan}
                    style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
                    className="flex-1 py-3.5 rounded-full font-black text-xs uppercase tracking-wider border-none cursor-pointer shadow-md hover:bg-[#A31C0C]"
                  >
                    {savingPlan
                      ? 'Saving Plan to Supabase...'
                      : editingPlanId
                      ? 'Update Weekly Plan in Supabase'
                      : 'Save Weekly Plan to Supabase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
