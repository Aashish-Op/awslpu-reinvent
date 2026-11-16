import type { Metadata } from "next"
import { OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Discover what awaits at Re:Invent Fest 2026: hands-on AWS cloud labs, a builders hackathon, networking lounges and more at Lovely Professional University, Punjab.",
  alternates: { canonical: "/experience" },
  openGraph: { url: "/experience", title: "Experience | Re:Invent Fest 2026", images: [OG_IMAGE] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
