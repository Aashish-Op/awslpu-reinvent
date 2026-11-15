import type { Metadata } from "next"
import { OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Schedule",
  description:
    "Full five-day schedule for Re:Invent Fest 2026 (Nov 30 – Dec 4) at LPU: keynotes, technical breakout sessions, workshops and speakers.",
  alternates: { canonical: "/schedule" },
  openGraph: { url: "/schedule", title: "Schedule | Re:Invent Fest 2026", images: [OG_IMAGE] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
