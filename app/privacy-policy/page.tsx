import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Re:Invent Fest 2026.",
};

const sections: LegalSection[] = [
  {
    title: "Information we collect",
    paragraphs: [
      "When you register or purchase a pass, we may collect your name, email address, phone number, institution, and payment-related details. We also receive information you provide when you contact the organizing team.",
      "Payment details are processed by our payment partner. We do not store complete card, UPI, or banking credentials on our servers.",
    ],
  },
  {
    title: "How we use your information",
    items: [
      "Create and manage your attendee account and digital pass.",
      "Process registrations, payments, confirmations, and event access.",
      "Send important event updates, schedule changes, and support responses.",
      "Improve registration, security, and the attendee experience.",
    ],
  },
  {
    title: "Sharing and retention",
    paragraphs: [
      "We share information only with service providers that help us operate registration, payments, communications, and event check-in, or when required by law. We do not sell attendee information.",
      "We retain information for as long as needed to provide the event services, meet legal and accounting obligations, resolve disputes, and enforce our agreements. We then delete or anonymize it where reasonably possible.",
    ],
  },
  {
    title: "Your choices and rights",
    paragraphs: [
      "You may request access to, correction of, or deletion of your personal information, subject to applicable law and records we must retain. You can also ask us to stop non-essential communications. Contact us at awsbuilders@awslpu.in for anything related to your privacy or personal information.",
    ],
  },
  {
    title: "Security and updates",
    paragraphs: [
      "We use reasonable administrative and technical safeguards, but no online service can guarantee absolute security. This policy may be updated when our practices or legal obligations change; the revised version will be posted on this page.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="YOUR DATA"
      title="Privacy Policy"
      description="How AWS Student Builder Group · LPU handles information for Re:Invent Fest 2026."
      updated="November 13, 2026"
      sections={sections}
    />
  );
}
