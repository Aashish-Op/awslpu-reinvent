import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or create your Re:Invent Fest 2026 account.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/auth" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
