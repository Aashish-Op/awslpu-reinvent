import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"
import { getAuthCookies } from "@/lib/api/auth-cookies"
import type { AuthUser } from "@/types/auth"

const ALLOWED_ROLES = ["volunteer", "organizer", "admin"]

export async function GET(request: Request) {
  const { accessToken } = getAuthCookies(request)

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Authentication required" },
      { status: 401 }
    )
  }

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
