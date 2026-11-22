import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"
import { getAuthCookies } from "@/lib/api/auth-cookies"
import type { AuthUser } from "@/types/auth"
import type { Order } from "@/types/ticketing"

const ALLOWED_ROLES = ["volunteer", "organizer", "admin"]

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { accessToken } = getAuthCookies(request)
  const { id } = await params

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 }
    )
  }

  // Handle /api/orders/analytics
  if (id.toLowerCase() === "analytics") {
    try {
      const userRes = await backendFetch("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (!userRes.ok) {
        return NextResponse.json(
          { detail: "Authentication required" },
          { status: 401 }
        )
      }

      const user: AuthUser = await userRes.json()
      const hasRole = user.roles?.some((r) =>
        ALLOWED_ROLES.includes(r.toLowerCase())
      )

      if (!hasRole) {
        return NextResponse.json(
          { detail: "Only volunteer, organizer, admin can access this endpoint" },
          { status: 403 }
        )
      }

      const url = new URL(request.url)
      const response = await backendFetch(`/api/v1/orders/analytics${url.search}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        return NextResponse.json(
          { detail: err?.detail || "Failed to fetch analytics" },
          { status: response.status }
        )
      }

      const data = await backendJson(response)
      return NextResponse.json(data)
    } catch (error) {
      return NextResponse.json(
        { detail: error instanceof Error ? error.message : "Internal error" },
        { status: 500 }
      )
    }
  }

  // Handle /api/orders/all
  if (id.toLowerCase() === "all") {
    try {
      const userRes = await backendFetch("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (!userRes.ok) {
        return NextResponse.json(
          { detail: "Authentication required" },
          { status: 401 }
        )
      }

      const user: AuthUser = await userRes.json()
      const hasRole = user.roles?.some((r) =>
        ALLOWED_ROLES.includes(r.toLowerCase())
      )

      if (!hasRole) {
        return NextResponse.json(
          { detail: "Only volunteer, organizer, admin can access this endpoint" },
          { status: 403 }
        )
      }

      const url = new URL(request.url)
      const response = await backendFetch(`/api/v1/orders/all${url.search}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        return NextResponse.json(
          { detail: err?.detail || "Failed to fetch orders" },
          { status: response.status }
        )
      }

      const data = await backendJson(response)
      return NextResponse.json(data)
    } catch (error) {
      return NextResponse.json(
        { detail: error instanceof Error ? error.message : "Internal error" },
        { status: 500 }
      )
    }
  }

  // Retrieve single order with ownership and role verification
  try {
    const [userRes, orderRes] = await Promise.all([
      backendFetch("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      backendFetch(`/api/v1/orders/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ])

    if (!userRes.ok) {
      return NextResponse.json(
        { detail: "Authentication required" },
        { status: 401 }
      )
    }

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => null)
      return NextResponse.json(
        { detail: err?.detail || "Order not found" },
        { status: orderRes.status }
      )
    }

    const user: AuthUser = await userRes.json()
    const order: Order = await orderRes.json()

    const isStaff = user.roles?.some((r) =>
      ALLOWED_ROLES.includes(r.toLowerCase())
    )

    // Allowed if user is staff (volunteer, organizer, admin) OR the owner of the order
    if (!isStaff && order.user_id !== user.id) {
      return NextResponse.json(
        { detail: "You do not have permission to access this order" },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
