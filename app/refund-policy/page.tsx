import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Refund Rules",
  description: "Refund rules for Re:Invent Fest 2026 passes.",
};

const sections: LegalSection[] = [
  {
    title: "Cancellation by an attendee",
    paragraphs: [
      "Passes are generally non-refundable after payment because places and event resources are reserved for each registered attendee. If you need to request an exception, contact the organizing team as soon as possible with your registration email and order ID.",
    ],
  },
  {
    title: "When a refund may apply",
    items: [
      "The event is cancelled and the organizer announces that refunds will be issued.",
      "The organizer is unable to provide the purchased pass and offers a refund.",
      "A duplicate or clearly incorrect charge is verified by the organizer or payment partner.",
      "A refund is required under applicable consumer protection law.",
    ],
  },
  {
    title: "Event changes and postponement",
    paragraphs: [
      "A change to speakers, sessions, timings, or venue does not automatically qualify for a refund. If the event is postponed or materially changed, the organizer will communicate the available options, which may include transfer of the pass or a refund window.",
    ],
  },
  {
    title: "Processing a refund",
    paragraphs: [
      "Approved refunds are sent to the original payment method through the payment partner. Processing times depend on the bank or payment provider and may take 5–10 business days after approval. We may request information needed to verify the transaction.",
    ],
  },
  {
    title: "How to contact us",
    paragraphs: [
      "Contact us at awsbuilders@awslpu.in for anything related to refunds. Include your full name, registered email address, order ID, and a short description of the request so we can investigate it efficiently.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="TICKETS & PAYMENTS"
      title="Refund Rules"
      description="Clear guidance on cancellations, event changes, and refunds for Re:Invent Fest 2026 passes."
      updated="November 13, 2026"
      sections={sections}
    />
  );
}
