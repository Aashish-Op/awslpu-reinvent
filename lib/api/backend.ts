import "server-only"

function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BACKEND_API_URL is not configured")
    }
    return "http://localhost:8000"
  }
  return url
}

export function getBackendApiKey(): string {
  return process.env.BACKEND_API_KEY || process.env.X_API_KEY || ""
}

export async function backendFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const backendApiUrl = getBackendApiUrl()
  const apiKey = getBackendApiKey()
  const headers = new Headers(options.headers)

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }

  if (apiKey && !headers.has("X-API-KEY")) {
    headers.set("X-API-KEY", apiKey)
  }

  return fetch(`${backendApiUrl.replace(/\/$/, "")}${path}`, {
    ...options,
    headers,
    cache: "no-store"
  })
}

export async function backendJson<T>(
  response: Response
): Promise<T> {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Backend request failed (${response.status})`

    throw new Error(message)
  }

  return data as T
}
