import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for Re:Invent Fest 2026.",
};

const sections: LegalSection[] = [
  {
    title: "About the event",
    paragraphs: [
      "Re:Invent Fest 2026 is a community technology festival hosted by AWS Student Builder Group at Lovely Professional University from November 30 to December 4, 2026. It is independently organized, is not an official AWS re:Invent event, and is not endorsed by AWS.",
    ],
  },
  {
    title: "Registration and passes",
    items: [
      "You must provide accurate, current information and keep your account credentials secure.",
      "Each attendee may register for a maximum of one pass. Passes are personal, non-transferable, and may be checked against a valid photo ID.",
      "A registration is confirmed only after successful payment and issuance of a digital pass.",
      "The organizer may refuse, cancel, or revoke a registration where information is inaccurate, payment is unauthorized, or these terms are violated.",
    ],
  },
  {
    title: "Attendee conduct",
    paragraphs: [
      "Attendees must follow venue rules, staff instructions, and applicable law. Harassment, discrimination, disruptive behavior, unauthorized recording, misuse of facilities, or conduct that puts others at risk may result in removal without refund.",
    ],
  },
  {
    title: "Event changes",
    paragraphs: [
      "The organizer may change speakers, sessions, timings, venues, or access arrangements when necessary. We will make reasonable efforts to communicate material changes through the contact details associated with your registration.",
    ],
  },
  {
    title: "Limitation and acceptance",
    paragraphs: [
      "To the extent permitted by law, the event is provided on an as-available basis and the organizer is not responsible for indirect losses, missed travel, or personal belongings. By registering, you acknowledge and accept these terms and the Privacy Policy. Contact us at awsbuilders@awslpu.in for anything related to these terms.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="BEFORE YOU REGISTER"
      title="Terms & Conditions"
      description="The rules that apply when you create an account, purchase a pass, and attend Re:Invent Fest 2026."
      updated="November 13, 2026"
      sections={sections}
    />
  );
}
