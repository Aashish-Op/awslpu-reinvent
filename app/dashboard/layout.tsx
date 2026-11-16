import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Dashboard",
  description:
    "Your Re:Invent Fest 2026 tickets and profile.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/dashboard" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
