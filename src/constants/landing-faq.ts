export const landingFaqItems = [
  {
    id: "book-ride",
    question: "How do I book a ride?",
    answer:
      "Set pickup and drop, choose a vehicle, confirm the fare, and tap Book. Track your captain live until you arrive.",
  },
  {
    id: "schedule",
    question: "Can I schedule for later?",
    answer:
      "Yes. Open When to go, pick a time, and confirm. We’ll match a captain closer to your scheduled pickup.",
  },
  {
    id: "payment",
    question: "What payments work?",
    answer:
      "Wallet, UPI, cards, and cash on select trips. Receipts stay in Wallet and Activity.",
  },
  {
    id: "cancel",
    question: "How do I cancel?",
    answer:
      "Cancel free in the short window after booking. If a captain is already en route, any fee is shown before you confirm.",
  },
  {
    id: "pin",
    question: "What is the ride PIN?",
    answer:
      "Share the PIN with your captain at pickup so only the right rider starts the trip.",
  },
  {
    id: "parcel",
    question: "How do I send a parcel?",
    answer:
      "Open Parcel, set pickup and drop, then book. Track delivery live with photo proof on eligible trips.",
  },
  {
    id: "ambulance",
    question: "How does SOS ambulance work?",
    answer:
      "Tap Emergency, enter pickup and hospital, and confirm. We match verified medical transport and share live updates.",
  },
  {
    id: "safety",
    question: "Is my ride safe?",
    answer:
      "Captains are verified. You get live tracking, trip share, in-app SOS, and support on every journey.",
  },
] as const;

/** Trim CMS/API question fluff for compact landing accordion labels. */
export function shortenLandingFaqQuestion(question: string): string {
  return question
    .replace(/\s+on (?:BW Rides|Bull Wave Rides)\??/gi, "?")
    .replace(/\s+through (?:BW Rides|Bull Wave Rides)\??/gi, "?")
    .replace(/\s+with (?:BW Rides|Bull Wave Rides)\??/gi, "?")
    .replace(/\s+does (?:BW Rides|Bull Wave Rides)\s+/gi, " ")
    .replace(/(?:BW Rides|Bull Wave Rides)\s+/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\?+/g, "?")
    .trim();
}
