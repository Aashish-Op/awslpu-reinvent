import { NextResponse } from "next/server"
import { backendFetch, backendJson } from "@/lib/api/backend"
import { getAuthCookies } from "@/lib/api/auth-cookies"

export async function GET() {
  try {
    const response = await backendFetch("/api/v1/venues/?include_inactive=true")
    if (response.ok) {
      const data = await backendJson<unknown[]>(response)
      return NextResponse.json(data)
    }
    return NextResponse.json([])
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  const { accessToken } = getAuthCookies(request)

  if (!accessToken) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const response = await backendFetch("/api/v1/venues/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { detail: data?.detail || "Failed to create venue" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
