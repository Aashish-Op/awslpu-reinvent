import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"
import { getAuthCookies } from "@/lib/api/auth-cookies"
import type { AuthUser } from "@/types/auth"
import type { Ticket } from "@/types/ticketing"

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

  // If id is "all", restrict to volunteer, organizer, admin
  if (id.toLowerCase() === "all") {
    try {
      const userRes = await backendFetch("/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
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
      const response = await backendFetch(`/api/v1/tickets/all${url.search}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        return NextResponse.json(
          { detail: err?.detail || "Failed to fetch tickets" },
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

  try {
    const response = await backendFetch(`/api/v1/tickets/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      return NextResponse.json(
        { detail: err?.detail || "Ticket not found" },
        { status: response.status }
      )
    }

    const data = await backendJson<Ticket>(response)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
