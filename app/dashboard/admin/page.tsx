"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Ticket,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  Search
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface CategoryStat {
  id: string
  name: string
  price_in_paise: number
  quantity: number
  quantity_sold: number
  quantity_reserved: number
  available: number
  is_active: boolean
}

interface RecentOrder {
  order_id: string
  status: string
  total_amount_paise: number
  currency: string
  created_at: string
  attendee_name: string
  attendee_email: string
  items: Array<{ category_name: string; quantity: number }>
}

interface AnalyticsData {
  total_orders: number
  paid_orders_count: number
  pending_orders_count: number
  failed_orders_count: number
  cancelled_orders_count: number
  total_revenue_paise: number
  category_stats: CategoryStat[]
  recent_orders: RecentOrder[]
}

interface SessionItem {
  id: string
  title: string
  description?: string
  session_type: string
  track?: string
  start_at?: string
  end_at?: string
  is_active: boolean
}

interface SpeakerItem {
  id: string
  full_name: string
  title?: string
  company?: string
  bio?: string
}

interface VenueItem {
  id: string
  name: string
  code: string
  building?: string
  capacity?: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, loading, authenticated } = useAuth()

  const [activeTab, setActiveTab] = useState<"overview" | "categories" | "sessions" | "speakers" | "venues">("overview")
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [speakers, setSpeakers] = useState<SpeakerItem[]>([])
  const [venues, setVenues] = useState<VenueItem[]>([])

  const [loadingData, setLoadingData] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Modals & form state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [catName, setCatName] = useState("")
  const [catDesc, setCatDesc] = useState("")
  const [catPrice, setCatPrice] = useState("0")
  const [catQty, setCatQty] = useState("100")
  const [submittingCat, setSubmittingCat] = useState(false)

  const [showSessionModal, setShowSessionModal] = useState(false)
  const [sessionTitle, setSessionTitle] = useState("")
  const [sessionDesc, setSessionDesc] = useState("")
  const [sessionType, setSessionType] = useState("keynote")
  const [sessionTrack, setSessionTrack] = useState("General")
  const [sessionStart, setSessionStart] = useState("2026-11-30T09:00")
  const [sessionEnd, setSessionEnd] = useState("2026-11-30T10:30")
  const [submittingSession, setSubmittingSession] = useState(false)

  const [showSpeakerModal, setShowSpeakerModal] = useState(false)
  const [speakerName, setSpeakerName] = useState("")
  const [speakerTitle, setSpeakerTitle] = useState("")
  const [speakerCompany, setSpeakerCompany] = useState("")
  const [speakerBio, setSpeakerBio] = useState("")
  const [submittingSpeaker, setSubmittingSpeaker] = useState(false)

  const [showVenueModal, setShowVenueModal] = useState(false)
  const [venueName, setVenueName] = useState("")
  const [venueCode, setVenueCode] = useState("")
  const [venueBuilding, setVenueBuilding] = useState("")
  const [venueCapacity, setVenueCapacity] = useState("500")
  const [submittingVenue, setSubmittingVenue] = useState(false)

  const [orderSearch, setOrderSearch] = useState("")

  const isAdmin = useMemo(() => {
    return Array.isArray(user?.roles) && user.roles.includes("admin")
  }, [user])

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/auth?mode=login&redirect=/dashboard/admin")
    }
  }, [loading, authenticated, router])

  const loadAllData = async () => {
    try {
      setRefreshing(true)
      const [analyticsRes, sessionsRes, speakersRes, venuesRes] = await Promise.all([
        fetch("/api/admin/analytics"),
        fetch("/api/admin/sessions"),
        fetch("/api/admin/speakers"),
        fetch("/api/admin/venues")
      ])

      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
      }
      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(Array.isArray(data) ? data : [])
      }
      if (speakersRes.ok) {
        const data = await speakersRes.json()
        setSpeakers(Array.isArray(data) ? data : [])
      }
      if (venuesRes.ok) {
        const data = await venuesRes.json()
        setVenues(Array.isArray(data) ? data : [])
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to load admin dashboard data" })
    } finally {
      setLoadingData(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      loadAllData()
    } else if (!loading) {
      setLoadingData(false)
    }
  }, [isAdmin, loading])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingCat(true)
    setActionMessage(null)
    try {
      const pricePaise = Math.round(parseFloat(catPrice || "0") * 100)
      const qtyNum = parseInt(catQty, 10) || 100

      const payload = {
        name: catName.trim(),
        description: catDesc.trim() || "Event admission pass for AWS Re:Invent Fest 2026.",
        price_in_paise: pricePaise,
        quantity: qtyNum,
        sales_start: new Date("2026-11-01T00:00:00Z").toISOString(),
        sales_end: new Date("2026-12-04T18:30:00Z").toISOString(),
        is_active: true
      }

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail || "Failed to create category")
      }

      setActionMessage({ type: "success", text: `Category '${catName}' created successfully!` })
      setShowCategoryModal(false)
      setCatName("")
      setCatDesc("")
      setCatPrice("0")
      setCatQty("100")
      await loadAllData()
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Error creating category" })
    } finally {
      setSubmittingCat(false)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingSession(true)
    setActionMessage(null)
    try {
      const payload = {
        title: sessionTitle.trim(),
        description: sessionDesc.trim(),
        session_type: sessionType,
        track: sessionTrack.trim(),
        start_at: new Date(sessionStart).toISOString(),
        end_at: new Date(sessionEnd).toISOString(),
        is_active: true
      }

      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail || "Failed to create session")
      }

      setActionMessage({ type: "success", text: `Session '${sessionTitle}' added to agenda!` })
      setShowSessionModal(false)
      setSessionTitle("")
      setSessionDesc("")
      await loadAllData()
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Error creating session" })
    } finally {
      setSubmittingSession(false)
    }
  }

  const handleCreateSpeaker = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingSpeaker(true)
    setActionMessage(null)
    try {
      const payload = {
        full_name: speakerName.trim(),
        title: speakerTitle.trim(),
        company: speakerCompany.trim(),
        bio: speakerBio.trim(),
        is_active: true
      }

      const res = await fetch("/api/admin/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail || "Failed to create speaker")
      }

      setActionMessage({ type: "success", text: `Speaker '${speakerName}' added successfully!` })
      setShowSpeakerModal(false)
      setSpeakerName("")
      setSpeakerTitle("")
      setSpeakerCompany("")
      setSpeakerBio("")
      await loadAllData()
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Error creating speaker" })
    } finally {
      setSubmittingSpeaker(false)
    }
  }

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingVenue(true)
    setActionMessage(null)
    try {
      const payload = {
        name: venueName.trim(),
        code: venueCode.trim().toUpperCase(),
        building: venueBuilding.trim() || undefined,
        capacity: parseInt(venueCapacity, 10) || 500,
        is_active: true
      }

      const res = await fetch("/api/admin/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.detail || "Failed to create venue")
      }

      setActionMessage({ type: "success", text: `Venue '${venueName}' added successfully!` })
      setShowVenueModal(false)
      setVenueName("")
      setVenueCode("")
      setVenueBuilding("")
      await loadAllData()
    } catch (err) {
      setActionMessage({ type: "error", text: err instanceof Error ? err.message : "Error creating venue" })
    } finally {
      setSubmittingVenue(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#FF00D4]" />
      </main>
    )
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 text-center text-white">
        <div className="mx-auto max-w-md border border-red-500/30 bg-red-500/10 p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <ShieldAlert className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-2xl font-light">Access Denied</h1>
          <p className="mt-2 text-xs text-white/60">
            You do not have administrator permissions to access the operations console. Your account is assigned role(s):{" "}
            <span className="font-mono text-[#FF00D4]">
              {user?.roles?.join(", ") || "attendee"}
            </span>.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 border border-white/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Attendee Portal
          </Link>
        </div>
      </main>
    )
  }

  const filteredOrders = (analytics?.recent_orders || []).filter((o) => {
    if (!orderSearch) return true
    const term = orderSearch.toLowerCase()
    return (
      o.order_id.toLowerCase().includes(term) ||
      o.attendee_name.toLowerCase().includes(term) ||
      o.attendee_email.toLowerCase().includes(term)
    )
  })

  const totalRevenue = ((analytics?.total_revenue_paise || 0) / 100).toLocaleString("en-IN")

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      {/* Background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(108,0,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_75%,rgba(255,0,212,0.08),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 pb-24 pt-28 sm:px-10 lg:px-16">
        {/* Top bar */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/50 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Attendee Portal
              </Link>
              <span className="text-white/20">/</span>
              <span className="flex items-center gap-1.5 rounded-full border border-[#FF00D4]/40 bg-[#FF00D4]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#FF00D4]">
                <ShieldCheck className="h-3 w-3" />
                Admin Console
              </span>
            </div>

            <h1 className="text-3xl font-light tracking-tight sm:text-5xl">
              Platform{" "}
              <span className="bg-linear-to-r from-[#FF2D87] via-[#FF00D4] to-[#8B5CFF] bg-clip-text text-transparent">
                Operations.
              </span>
            </h1>
            <p className="mt-2 text-xs text-white/55">
              AWS Re:Invent Fest 2026 • Live registrations, pass inventory, sessions, and speakers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAllData}
              disabled={refreshing}
              className="flex items-center gap-2 border border-white/15 bg-white/3 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:border-white/30 hover:bg-white/6 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#FF00D4]" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Refresh Data"}</span>
            </button>
          </div>
        </div>

        {/* Action toast */}
        {actionMessage && (
          <div
            className={`mt-6 flex items-center justify-between border p-4 text-xs ${
              actionMessage.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {actionMessage.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="text-white/40 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary KPI Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="uppercase tracking-wider">Paid Attendees</span>
              <Users className="h-4 w-4 text-[#FF00D4]" />
            </div>
            <p className="mt-3 text-3xl font-light text-white">
              {analytics?.paid_orders_count ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-white/40">
              Across {analytics?.total_orders ?? 0} total attempted orders
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="uppercase tracking-wider">Gross Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 text-3xl font-light text-white">₹{totalRevenue}</p>
            <p className="mt-1 text-[11px] text-emerald-400/80">Confirmed Razorpay settlements</p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="uppercase tracking-wider">Active Pass Tiers</span>
              <Ticket className="h-4 w-4 text-[#8B5CFF]" />
            </div>
            <p className="mt-3 text-3xl font-light text-white">
              {analytics?.category_stats?.length ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-white/40">
              {analytics?.category_stats?.reduce((acc, c) => acc + (c.quantity_sold || 0), 0) ?? 0} passes issued
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-6">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="uppercase tracking-wider">Sessions & Agenda</span>
              <Calendar className="h-4 w-4 text-[#FF2D87]" />
            </div>
            <p className="mt-3 text-3xl font-light text-white">{sessions.length}</p>
            <p className="mt-1 text-[11px] text-white/40">
              {speakers.length} speakers • {venues.length} venues
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-10 flex gap-2 overflow-x-auto border-b border-white/10 pb-px scrollbar-none">
          {[
            { id: "overview", label: "Overview & Orders", icon: TrendingUp },
            { id: "categories", label: "Passes & Categories", icon: Ticket },
            { id: "sessions", label: "Schedule & Sessions", icon: Calendar },
            { id: "speakers", label: "Speakers", icon: Users },
            { id: "venues", label: "Venues", icon: MapPin }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all ${
                  isActive
                    ? "border-[#FF00D4] text-[#FF00D4] bg-white/[0.02]"
                    : "border-transparent text-white/50 hover:text-white hover:border-white/20"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB 1: OVERVIEW & ORDERS */}
        {activeTab === "overview" && (
          <div className="mt-8 space-y-8">
            {/* Category Capacities */}
            <div className="border border-white/10 bg-white/[0.015] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-light text-white">Pass Inventory Utilization</h3>
                  <p className="text-xs text-white/45">Capacity allocated vs passes claimed</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-1.5 bg-[#FF00D4] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,212,0.3)] hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Pass Tier</span>
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {(analytics?.category_stats || []).map((cat) => {
                  const pct = cat.quantity > 0 ? Math.min(100, Math.round((cat.quantity_sold / cat.quantity) * 100)) : 0
                  return (
                    <div key={cat.id} className="border border-white/10 bg-black/40 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{cat.name}</span>
                        <span className="text-[11px] font-mono text-[#FF2D87]">
                          ₹{cat.price_in_paise / 100}
                        </span>
                      </div>
                      <div className="mt-4 flex items-baseline justify-between text-xs text-white/60">
                        <span>Sold: {cat.quantity_sold} / {cat.quantity}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden bg-white/10">
                        <div
                          className="h-full bg-linear-to-r from-[#FF00D4] to-[#702cff] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] text-white/40">
                        <span>Available: {cat.available}</span>
                        <span>{cat.is_active ? "● Active" : "○ Inactive"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Orders Table */}
            <div className="border border-white/10 bg-white/[0.015] p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-6">
                <div>
                  <h3 className="text-lg font-light text-white">Recent Transactions</h3>
                  <p className="text-xs text-white/45">Live orders recorded by the checkout engine</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by name, email, order..."
                    className="w-full border border-white/15 bg-white/3 py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 focus:border-[#FF00D4] focus:outline-hidden"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center text-xs text-white/40">
                  No orders match your search query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/70">
                    <thead className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/40">
                      <tr>
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Attendee</th>
                        <th className="py-3 px-3">Email</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Items</th>
                        <th className="py-3 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {filteredOrders.map((ord) => {
                        const isPaid = ord.status === "paid"
                        const isFailed = ord.status === "failed"
                        return (
                          <tr key={ord.order_id} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-3 text-[#FF2D87]">
                              {ord.order_id.slice(-8)}
                            </td>
                            <td className="py-3 px-3 font-sans text-white font-medium">
                              {ord.attendee_name || "—"}
                            </td>
                            <td className="py-3 px-3 text-white/55">
                              {ord.attendee_email}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 text-[9px] uppercase font-semibold tracking-wider ${
                                  isPaid
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                    : isFailed
                                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                    : "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-white">
                              ₹{(ord.total_amount_paise / 100).toFixed(2)}
                            </td>
                            <td className="py-3 px-3 text-white/60 font-sans">
                              {ord.items?.map((it) => it.category_name).join(", ") || "1 Pass"}
                            </td>
                            <td className="py-3 px-3 text-white/40">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : "—"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PASSES & CATEGORIES */}
        {activeTab === "categories" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-light text-white">Ticket Categories</h3>
                <p className="text-xs text-white/50">Manage tier capacities, pricing, and availability</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-2 bg-[#FF00D4] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,212,0.3)] hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span>Create New Tier</span>
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {(analytics?.category_stats || []).map((cat) => (
                <div key={cat.id} className="border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider text-[#FF00D4] font-semibold">
                        {cat.is_active ? "Live on Store" : "Inactive"}
                      </span>
                      <span className="font-mono text-xs text-white/40">ID: {cat.id.slice(-6)}</span>
                    </div>

                    <h4 className="mt-3 text-xl font-light text-white">{cat.name}</h4>
                    <div className="my-4 flex items-baseline gap-2">
                      <span className="text-4xl font-extralight text-white">₹{cat.price_in_paise / 100}</span>
                      <span className="text-xs uppercase text-white/40 tracking-wider">INR</span>
                    </div>

                    <div className="space-y-2 border-t border-white/10 pt-4 text-xs text-white/60">
                      <div className="flex justify-between">
                        <span>Total Capacity:</span>
                        <span className="text-white font-medium">{cat.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Passes Sold:</span>
                        <span className="text-emerald-400 font-medium">{cat.quantity_sold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reserved in Carts:</span>
                        <span className="text-yellow-400 font-medium">{cat.quantity_reserved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available Remaining:</span>
                        <span className="text-[#FF2D87] font-medium">{cat.available}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SESSIONS */}
        {activeTab === "sessions" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-light text-white">Festival Agenda & Sessions</h3>
                <p className="text-xs text-white/50">Manage keynotes, hands-on workshops, and hackathons</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSessionModal(true)}
                className="flex items-center gap-2 bg-[#FF00D4] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,212,0.3)] hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span>Add Session</span>
              </button>
            </div>

            <div className="divide-y divide-white/10 border border-white/10 bg-white/[0.015]">
              {sessions.length === 0 ? (
                <div className="p-12 text-center text-xs text-white/40">
                  No sessions have been added to the database yet. Click "Add Session" to publish the first agenda item.
                </div>
              ) : (
                sessions.map((ses) => (
                  <div key={ses.id} className="p-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="border border-[#8B5CFF]/40 bg-[#8B5CFF]/15 px-2 py-0.5 text-[9px] uppercase tracking-wider text-[#B69AFF] font-medium">
                          {ses.session_type}
                        </span>
                        {ses.track && (
                          <span className="text-[10px] uppercase text-white/40 tracking-wider">
                            {ses.track}
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-lg font-light text-white">{ses.title}</h4>
                      {ses.description && (
                        <p className="mt-1 text-xs text-white/50 max-w-xl">{ses.description}</p>
                      )}
                    </div>

                    <div className="text-xs text-white/60 space-y-1 md:text-right shrink-0">
                      {ses.start_at && (
                        <div className="flex items-center gap-1.5 md:justify-end">
                          <Clock className="h-3 w-3 text-[#FF2D87]" />
                          <span>{new Date(ses.start_at).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="text-[10px] uppercase text-white/40">
                        {ses.is_active ? "● Live in Schedule" : "○ Hidden"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SPEAKERS */}
        {activeTab === "speakers" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-light text-white">Event Speakers</h3>
                <p className="text-xs text-white/50">Industry leaders, AWS heroes, and community keynote speakers</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSpeakerModal(true)}
                className="flex items-center gap-2 bg-[#FF00D4] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,212,0.3)] hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span>Add Speaker</span>
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {speakers.length === 0 ? (
                <div className="col-span-3 border border-white/10 bg-white/[0.015] p-12 text-center text-xs text-white/40">
                  No speakers recorded yet. Use the button above to add speakers.
                </div>
              ) : (
                speakers.map((spk) => (
                  <div key={spk.id} className="border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-linear-to-tr from-[#FF00D4]/20 to-[#702cff]/20 text-white font-medium">
                        {spk.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-light text-white">{spk.full_name}</h4>
                        <p className="text-xs text-[#FF2D87]">
                          {spk.title || "Speaker"} {spk.company ? `• ${spk.company}` : ""}
                        </p>
                      </div>
                    </div>
                    {spk.bio && (
                      <p className="mt-4 text-xs leading-relaxed text-white/50 line-clamp-3">
                        {spk.bio}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: VENUES */}
        {activeTab === "venues" && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-light text-white">Campus Venues & Auditoriums</h3>
                <p className="text-xs text-white/50">Locations for keynotes, breakout tracks, and hackathon spaces</p>
              </div>
              <button
                type="button"
                onClick={() => setShowVenueModal(true)}
                className="flex items-center gap-2 bg-[#FF00D4] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,212,0.3)] hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                <span>Add Venue</span>
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {venues.length === 0 ? (
                <div className="col-span-3 border border-white/10 bg-white/[0.015] p-12 text-center text-xs text-white/40">
                  No venues configured yet.
                </div>
              ) : (
                venues.map((ven) => (
                  <div key={ven.id} className="border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#8B5CFF] font-semibold">
                        CODE: {ven.code}
                      </span>
                      <span className="text-xs text-white/40">Capacity: {ven.capacity ?? "—"}</span>
                    </div>
                    <h4 className="mt-3 text-lg font-light text-white">{ven.name}</h4>
                    {ven.building && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/50">
                        <MapPin className="h-3 w-3 text-[#FF00D4]" />
                        <span>Building: {ven.building}</span>
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CREATE CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-[#FF00D4] bg-[#0c0816] p-6 sm:p-8 shadow-[0_0_50px_rgba(255,0,212,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-light text-white">New Ticket Pass Tier</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1">Pass Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. VIP All-Access Pass"
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF00D4] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Access to keynotes, workshops, badge kit..."
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF00D4] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={catPrice}
                    onChange={(e) => setCatPrice(e.target.value)}
                    placeholder="0 for Free"
                    className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF00D4] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Quantity Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={catQty}
                    onChange={(e) => setCatQty(e.target.value)}
                    placeholder="100"
                    className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF00D4] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="border border-white/20 px-4 py-2 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCat}
                  className="bg-[#FF00D4] px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submittingCat ? "Creating..." : "Save Pass"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SESSION */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-[#8B5CFF] bg-[#0c0816] p-6 sm:p-8 shadow-[0_0_50px_rgba(139,92,255,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-light text-white">Add Festival Session</h3>
              <button
                type="button"
                onClick={() => setShowSessionModal(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Keynote: Future of Generative AI on AWS"
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#8B5CFF] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">Session Type *</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full border border-white/15 bg-[#141120] p-2.5 text-white focus:border-[#8B5CFF] focus:outline-hidden"
                  >
                    <option value="keynote">Keynote</option>
                    <option value="workshop">Workshop</option>
                    <option value="breakout">Breakout Track</option>
                    <option value="panel">Panel Discussion</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Track Name</label>
                  <input
                    type="text"
                    value={sessionTrack}
                    onChange={(e) => setSessionTrack(e.target.value)}
                    placeholder="e.g. AI / Cloud Ops"
                    className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#8B5CFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={sessionDesc}
                  onChange={(e) => setSessionDesc(e.target.value)}
                  placeholder="Summary of topics covered..."
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#8B5CFF] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={sessionStart}
                    onChange={(e) => setSessionStart(e.target.value)}
                    className="w-full border border-white/15 bg-white/3 p-2 text-white focus:border-[#8B5CFF] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">End Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={sessionEnd}
                    onChange={(e) => setSessionEnd(e.target.value)}
                    className="w-full border border-white/15 bg-white/3 p-2 text-white focus:border-[#8B5CFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="border border-white/20 px-4 py-2 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSession}
                  className="bg-[#8B5CFF] px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submittingSession ? "Adding..." : "Add Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SPEAKER */}
      {showSpeakerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-[#FF2D87] bg-[#0c0816] p-6 sm:p-8 shadow-[0_0_50px_rgba(255,45,135,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-light text-white">Add Event Speaker</h3>
              <button
                type="button"
                onClick={() => setShowSpeakerModal(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpeaker} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={speakerName}
                  onChange={(e) => setSpeakerName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF2D87] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={speakerTitle}
                    onChange={(e) => setSpeakerTitle(e.target.value)}
                    placeholder="e.g. Principal Solutions Architect"
                    className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF2D87] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Organization / Company</label>
                  <input
                    type="text"
                    value={speakerCompany}
                    onChange={(e) => setSpeakerCompany(e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF2D87] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">Short Biography</label>
                <textarea
                  rows={3}
                  value={speakerBio}
                  onChange={(e) => setSpeakerBio(e.target.value)}
                  placeholder="Specialization in distributed cloud systems..."
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-[#FF2D87] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSpeakerModal(false)}
                  className="border border-white/20 px-4 py-2 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSpeaker}
                  className="bg-[#FF2D87] px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {submittingSpeaker ? "Saving..." : "Save Speaker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE VENUE */}
      {showVenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg border border-emerald-400 bg-[#0c0816] p-6 sm:p-8 shadow-[0_0_50px_rgba(52,211,153,0.3)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-light text-white">Add Campus Venue</h3>
              <button
                type="button"
                onClick={() => setShowVenueModal(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Shanti Devi Mittal Auditorium"
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-emerald-400 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={venueCode}
                    onChange={(e) => setVenueCode(e.target.value)}
                    placeholder="e.g. AUD-MAIN-01"
                    className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-emerald-400 focus:outline-hidden uppercase"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={venueCapacity}
                    onChange={(e) => setVenueCapacity(e.target.value)}
                    placeholder="500"
                    className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-emerald-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/60 mb-1">Building / Block</label>
                <input
                  type="text"
                  value={venueBuilding}
                  onChange={(e) => setVenueBuilding(e.target.value)}
                  placeholder="e.g. Block 32, 2nd Floor"
                  className="w-full border border-white/15 bg-white/3 p-2.5 text-white focus:border-emerald-400 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="border border-white/20 px-4 py-2 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVenue}
                  className="bg-emerald-400 px-6 py-2 font-semibold text-black hover:opacity-90 disabled:opacity-50"
                >
                  {submittingVenue ? "Saving..." : "Save Venue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
