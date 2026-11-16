export const SITE_URL = "https://reinvent.awslpu.in"
export const SITE_NAME = "Re:Invent Fest 2026"

export const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Re:Invent Fest 2026",
  description:
    "A five-day technology festival hosted by AWS Student Builder Group at Lovely Professional University, Punjab, featuring keynotes, technical breakout tracks, hands-on cloud labs and a builders hackathon.",
  startDate: "2026-11-30T09:00:00+05:30",
  endDate: "2026-12-04T18:00:00+05:30",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [`${SITE_URL}/og-image.png`],
  url: SITE_URL,
  location: {
    "@type": "Place",
    name: "Lovely Professional University",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jalandhar - Delhi G.T. Road",
      addressLocality: "Phagwara",
      addressRegion: "Punjab",
      postalCode: "144411",
      addressCountry: "IN"
    }
  },
  organizer: {
    "@type": "Organization",
    name: "AWS Student Builder Group LPU",
    url: SITE_URL
  },
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/tickets`,
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
    validFrom: "2026-10-01T00:00:00+05:30"
  }
}

export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Re:Invent Fest 2026 at Lovely Professional University"
}
