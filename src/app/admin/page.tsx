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
  UserCheck
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
  category?: string
  status: 'active' | 'inactive' | 'pending' | 'rejected'
  is_featured?: boolean
  image_url?: string
}

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

  // New Item Modal State
  const [showItemModal, setShowItemModal] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    calories: '',
    category: 'rice',
    image_url: '/hero-plate.jpg',
  })
  const [savingItem, setSavingItem] = useState(false)

  // Weekly Subscriptions Modal State
  const [showSubModal, setShowSubModal] = useState(false)
  const [newSub, setNewSub] = useState({
    user_name: '',
    phone: '',
    email: '',
    package_plan: '7-Day Executive Lunch Box (Chicken Karahi & Rice)',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [savingSub, setSavingSub] = useState(false)

  // Verify Admin Status
  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/admin/orders').then((r) => r.json())
      if (res.error === 'Admin access required') {
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
        body: JSON.stringify({ key: adminPassword || adminEmail }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      toast.success('Admin Secret Key verified! Unlocking Dashboard...')
      setIsAdmin(true)
      loadOrders()
    } catch (err: any) {
      toast.error(err.message || 'Invalid admin key')
    } finally {
      setLoggingIn(false)
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
      if (activeTab === 'menu') loadMenu()
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

  // Create Food Item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingItem(true)
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          calories: parseInt(newItem.calories) || 450,
          category: newItem.category,
          image_url: newItem.image_url,
          status: 'active',
        }),
      }).then((r) => r.json())

      if (res.data) {
        toast.success(`Created "${newItem.name}"`)
        setShowItemModal(false)
        setNewItem({ name: '', description: '', price: '', calories: '', category: 'rice', image_url: '/hero-plate.jpg' })
        loadMenu()
      } else {
        toast.error(res.error || 'Failed to create menu item')
      }
    } catch (e) {
      toast.error('Error creating menu item')
    } finally {
      setSavingItem(false)
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
        toast.success(`"${item.name}" is now ${nextStatus === 'active' ? 'AVAILABLE' : 'OUT OF STOCK'}`)
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

  // Admin Login Screen
  if (isAdmin === false) {
    return (
      <div style={{ backgroundColor: '#FFFFEF', color: '#C7230F' }} className="min-h-screen pt-32 pb-16 px-4 font-sans flex flex-col items-center justify-center">
        <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.3)' }} className="rounded-[2.5rem] border-2 p-8 sm:p-12 shadow-2xl max-w-md w-full text-center">
          <div style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }} className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <ShieldCheck size={32} style={{ color: '#FFFFEF' }} />
          </div>
          <h1 style={{ color: '#C7230F' }} className="font-serif font-black text-2xl mb-2">Admin Portal Login</h1>
          <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80 mb-6">Enter your Admin Secret Key from .env.local to access live orders & management</p>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 text-left">
            <div>
              <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase tracking-wider mb-1">
                Admin Secret Key
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••••••"
                style={{ backgroundColor: '#FFFFEF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                className="w-full p-3.5 rounded-xl border-2 font-mono font-black text-sm outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
              className="mt-2 w-full py-4 rounded-full font-black text-sm uppercase tracking-wider shadow-lg hover:bg-[#A31C0C] cursor-pointer border-none"
            >
              {loggingIn ? 'Authenticating...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#FFFFEF', color: '#C7230F' }} className="min-h-screen pt-28 pb-16 px-4 sm:px-8 font-sans">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }} className="inline-flex items-center gap-1.5 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
              <Sparkles size={13} style={{ color: '#FFFFEF' }} />
              <span>CAMO'S FOODS MANAGEMENT</span>
            </div>
            <h1 style={{ color: '#C7230F' }} className="font-serif font-black text-3xl sm:text-4xl">
              Admin Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === 'orders') loadOrders()
                if (activeTab === 'menu') loadMenu()
                if (activeTab === 'subscriptions') loadSubscriptions()
                if (activeTab === 'deals') loadDeals()
              }}
              style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.3)', color: '#C7230F' }}
              className="p-3 rounded-2xl border-2 font-bold text-xs flex items-center gap-2 cursor-pointer hover:border-[#C7230F]"
            >
              <RefreshCw size={16} />
              <span>Refresh Data</span>
            </button>

            <button
              onClick={() => setShowSubModal(true)}
              style={{ backgroundColor: '#FFFFFF', borderColor: '#C7230F', color: '#C7230F' }}
              className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 border-2 cursor-pointer hover:bg-[#FFFFEF]"
            >
              <UserCheck size={16} style={{ color: '#C7230F' }} />
              <span>Add Weekly Subscriber</span>
            </button>

            <button
              onClick={() => setShowItemModal(true)}
              style={{ backgroundColor: '#C7230F', color: '#FFFFEF' }}
              className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:bg-[#A31C0C] cursor-pointer border-none"
            >
              <Plus size={16} style={{ color: '#FFFFEF' }} />
              <span>Add Food Item</span>
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
            { id: 'subscriptions', label: `Weekly Packages (${subscriptions.length})`, icon: <Calendar size={16} /> },
            { id: 'menu', label: `Menu Catalog (${foodItems.length})`, icon: <Package size={16} /> },
            { id: 'overview', label: 'Dashboard Overview', icon: <TrendingUp size={16} /> },
            { id: 'deals', label: 'Promos & Deals', icon: <Tag size={16} /> },
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
                          {(o.subtotal === 3550 || o.subtotal === 5250 || o.subtotal === 2800 || o.subtotal === 3750 || o.subtotal === 3900 || o.order_items?.some(it => it.name_at_order?.toLowerCase().includes('plan') || it.name_at_order?.toLowerCase().includes('package'))) && (
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
                              1x {o.subtotal === 3550 ? '5-Day Diet Plan' : o.subtotal === 5250 ? '7-Day Diet Plan' : o.subtotal === 2800 ? '5-Day Desi Plan' : o.subtotal === 3750 ? '7-Day Desi Plan (Chicken Qeema)' : o.subtotal === 3900 ? '7-Day Desi Plan (Beef Qeema)' : 'Gourmet Meal Item'}
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

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div>
            {/* Products Summary Bar */}
            <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.25)' }} className="p-4 sm:p-6 rounded-3xl border-2 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-xl mb-1">
                  Full Menu Catalog ({foodItems.length} Products)
                </h2>
                <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-80">
                  Manage product availability, pricing, and catalog items in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span style={{ backgroundColor: '#047857', color: '#FFFFEF' }} className="font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  {activeProductsCount} Available
                </span>
                <span style={{ backgroundColor: '#DC2626', color: '#FFFFEF' }} className="font-black text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider">
                  {outOfStockCount} Out of Stock
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodItems.map((item) => {
                const isAvailable = item.status === 'active'

                return (
                  <div
                    key={item.id}
                    style={{ backgroundColor: '#FFFFFF', borderColor: isAvailable ? 'rgba(199,35,15,0.25)' : 'rgba(220,38,38,0.4)' }}
                    className="rounded-3xl p-5 border-2 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span style={{ backgroundColor: 'rgba(199,35,15,0.1)', color: '#C7230F' }} className="font-black text-[10px] px-2.5 py-1 rounded-md uppercase">
                          {item.category || 'Main'}
                        </span>
                        <span
                          style={{
                            backgroundColor: isAvailable ? '#047857' : '#DC2626',
                            color: '#FFFFEF',
                          }}
                          className="font-black text-[10px] px-2.5 py-1 rounded-md uppercase"
                        >
                          {isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}
                        </span>
                      </div>
                      <h3 style={{ color: '#C7230F' }} className="font-black text-lg mb-1">{item.name}</h3>
                      <p style={{ color: '#C7230F' }} className="text-xs font-bold opacity-75 leading-relaxed mb-4">{item.description}</p>
                    </div>

                    <div className="pt-3 border-t border-[#C7230F]/15 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span style={{ color: '#C7230F' }} className="font-black text-base">PKR {item.price}</span>
                        <span style={{ color: '#C7230F' }} className="text-xs font-bold opacity-70">{item.calories} kcal</span>
                      </div>

                      {/* Admin Product Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleItemStatus(item)}
                          style={{
                            backgroundColor: isAvailable ? 'rgba(220,38,38,0.1)' : '#047857',
                            color: isAvailable ? '#DC2626' : '#FFFFEF',
                            borderColor: isAvailable ? 'rgba(220,38,38,0.3)' : '#047857',
                          }}
                          className="flex-1 py-2 px-3 rounded-xl border font-black text-xs uppercase tracking-wider cursor-pointer transition-all hover:scale-102"
                        >
                          {isAvailable ? 'Mark Out of Stock' : 'Mark Available'}
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

        {/* DEALS TAB */}
        {activeTab === 'deals' && (
          <div style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(199,35,15,0.2)' }} className="rounded-3xl p-8 border-2 text-center font-bold text-sm">
            Deals & Storewide Promos Active
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
                    placeholder="e.g. 7-Day Executive Lunch Box"
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

        {/* ADD ITEM MODAL */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div style={{ backgroundColor: '#FFFFEF', borderColor: '#C7230F' }} className="rounded-[2.5rem] border-2 p-8 max-w-lg w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 style={{ color: '#C7230F' }} className="font-serif font-black text-2xl">Add New Food Item</h2>
                <button onClick={() => setShowItemModal(false)} className="bg-transparent border-none cursor-pointer p-1">
                  <X size={20} style={{ color: '#C7230F' }} />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="flex flex-col gap-4">
                <div>
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Special Mutton Karahi"
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                    className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Price (PKR)</label>
                    <input
                      type="number"
                      required
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      placeholder="850"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Calories</label>
                    <input
                      type="number"
                      required
                      value={newItem.calories}
                      onChange={(e) => setNewItem({ ...newItem, calories: e.target.value })}
                      placeholder="650"
                      style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                      className="w-full p-3 rounded-xl border-2 font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: '#C7230F' }} className="block text-xs font-black uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Slow cooked with fresh herbs and authentic spices..."
                    style={{ backgroundColor: '#FFFFFF', color: '#C7230F', borderColor: 'rgba(199,35,15,0.3)' }}
                    className="w-full p-3 rounded-xl border-2 font-bold text-xs outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-4">
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
                    {savingItem ? 'Saving Item...' : 'Save Item to Menu'}
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
