import type { Metadata } from "next"
import { OG_IMAGE } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Tickets & Passes",
  description:
    "Book your pass for Re:Invent Fest 2026 at Lovely Professional University. Choose Student, Builder or All-Access VIP passes for five days of keynotes, cloud labs and a 48-hour hackathon.",
  alternates: { canonical: "/tickets" },
  openGraph: { url: "/tickets", title: "Tickets & Passes | Re:Invent Fest 2026", images: [OG_IMAGE] },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
