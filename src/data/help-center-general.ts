import { ROUTES } from "@/constants/routes";
import type { HelpArticle } from "./help-center";

export const accountSignInHub: HelpArticle = {
  id: "sign-in-access",
  title: "Sign-in and access",
  kind: "hub",
  children: [
    {
      id: "cant-sign-in",
      title: "Can't sign in or request a trip",
      kind: "content",
      paragraphs: [
        "Verify your phone number and OTP. Ensure you have a stable internet connection.",
        "If issues persist, try logging out and signing in again, or contact support.",
      ],
    },
  ],
};

export const accountProfileHub: HelpArticle = {
  id: "profile-settings",
  title: "Profile and settings",
  kind: "hub",
  children: [
    {
      id: "account-settings",
      title: "Account settings",
      kind: "content",
      paragraphs: [
        "Update your name, phone number, email, and language preferences in Account Settings.",
      ],
      link: { label: "Open Account Settings", href: ROUTES.profileAccountSettings },
    },
    {
      id: "lost-phone",
      title: "I lost my phone in Bull Wave Rides",
      kind: "content",
      paragraphs: [
        "Select the relevant trip in Bookings and report a lost phone.",
        "We'll help you contact the captain. Have your account verified for faster support.",
      ],
    },
  ],
};

export const accountPaymentsHub: HelpArticle = {
  id: "payments-billing",
  title: "Payments and billing",
  kind: "hub",
  children: [
    {
      id: "payment-methods",
      title: "Payment methods",
      kind: "content",
      paragraphs: [
        "Add or manage cash, UPI, cards, and Bull Wave Rides Wallet from the Wallet page.",
      ],
      link: { label: "Open Wallet", href: ROUTES.wallet },
    },
    {
      id: "duplicate-charges",
      title: "Duplicate or unknown charges",
      kind: "content",
      paragraphs: [
        "Pending authorizations may appear temporarily and disappear within a few days.",
        "Report unknown charges with your trip receipt via Help & Support.",
      ],
    },
    {
      id: "gift-cards",
      title: "Gift cards and vouchers",
      kind: "content",
      paragraphs: [
        "Redeem gift cards in Wallet. Enter the code under Bull Wave Rides Cash to add balance.",
      ],
    },
    {
      id: "promos",
      title: "Promos and partnerships",
      kind: "content",
      paragraphs: [
        "Apply promo codes at checkout before confirming your booking.",
        "Each promo has specific terms, expiry dates, and service restrictions.",
      ],
    },
    {
      id: "wavego-cash",
      title: "Bull Wave Rides Cash",
      kind: "content",
      paragraphs: [
        "Bull Wave Rides Cash is your in-app wallet balance for rides and deliveries.",
        "Top up, view history, and manage refunds from the Wallet tab.",
      ],
      link: { label: "Open Wallet", href: ROUTES.wallet },
    },
    {
      id: "receipts",
      title: "Receipts and invoices",
      kind: "content",
      paragraphs: [
        "Trip receipts are available in Bookings for completed trips.",
        "Email copies can be requested from the trip details screen.",
      ],
    },
  ],
};

export const safetyEmergencyArticles: HelpArticle[] = [
  {
    id: "in-app-safety-tools",
    title: "In-app safety tools",
    kind: "faq",
    faqCategory: "Safety",
    faqMatch: "sos|safety mode|share",
    numberedList: [
      "During an active trip, open live tracking.",
      "Use Share trip to send your route and ETA to a trusted contact.",
      "Open Safety Mode or SOS if you need urgent help. Captains and support are alerted.",
      "Add an emergency contact in Account settings so SOS can reach them faster.",
    ],
    relatedLinks: [
      { label: "Open SOS", href: ROUTES.sos },
      { label: "Safety tools", href: ROUTES.safety },
      { label: "Emergency contact", href: ROUTES.profileEmergencyContact },
    ],
  },
  {
    id: "women-safety",
    title: "Women safety & women captains",
    kind: "faq",
    faqCategory: "Safety",
    faqMatch: "women",
    relatedLinks: [
      { label: "Open SOS", href: ROUTES.sos },
      { label: "Safety tools", href: ROUTES.safety },
    ],
  },
  {
    id: "emergency-contact",
    title: "Emergency contact",
    kind: "faq",
    faqCategory: "Safety",
    faqMatch: "emergency contact",
    relatedLinks: [
      { label: "Add emergency contact", href: ROUTES.profileEmergencyContact },
    ],
  },
  {
    id: "request-ambulance",
    title: "Request an ambulance",
    kind: "content",
    numberedList: [
      "For a medical emergency, also call 112.",
      "In the app, open Ambulance / SOS and confirm your pickup location.",
      "Stay on the line with support if a dispatcher contacts you.",
      "After the trip, you can review it under Ambulance history.",
    ],
    relatedLinks: [
      { label: "Book ambulance SOS", href: ROUTES.ambulanceBook },
      { label: "Open SOS", href: ROUTES.sos },
    ],
  },
  {
    id: "report-safety-incident",
    title: "Report a safety incident",
    kind: "report-form",
    numberedList: [
      "Include the trip date, time, and what happened.",
      "If the trip is still active, open SOS first.",
    ],
    relatedLinks: [{ label: "Open SOS", href: ROUTES.sos }],
  },
  {
    id: "read-safety-policy",
    title: "Read Safety Policy",
    kind: "content",
    numberedList: [
      "The full Safety Policy covers riders, captains, and emergency bookings.",
      "Open it below for the latest published version.",
    ],
    relatedLinks: [
      { label: "Open Safety Policy", href: ROUTES.safety },
      { label: "Legal safety policy", href: ROUTES.legalSafety },
    ],
  },
];

export const safetyPolicyHub: HelpArticle = {
  id: "safety-policy",
  title: "Safety Policy",
  kind: "hub",
  children: safetyEmergencyArticles.filter((a) =>
    ["read-safety-policy", "in-app-safety-tools"].includes(a.id),
  ),
};

export const emergencyAssistanceHub: HelpArticle = {
  id: "emergency-assistance",
  title: "Emergency assistance",
  kind: "hub",
  children: safetyEmergencyArticles.filter((a) =>
    ["request-ambulance", "report-safety-incident"].includes(a.id),
  ),
};

export const tripSafetyHelpHub: HelpArticle = {
  id: "trip-safety-help",
  title: "Safety during a trip",
  kind: "hub",
  children: safetyEmergencyArticles.filter((a) =>
    ["in-app-safety-tools", "women-safety", "emergency-contact"].includes(a.id),
  ),
};

export const guidesGettingStartedHub: HelpArticle = {
  id: "getting-started-guide",
  title: "Getting started",
  kind: "hub",
  children: [
    { id: "signing-up", title: "Account & sign-in", kind: "faq", faqCategory: "Account" },
    { id: "getting-started", title: "Booking a ride", kind: "faq", faqCategory: "Rides" },
  ],
};

export const guidesPoliciesHub: HelpArticle = {
  id: "policies-legal",
  title: "Policies and legal",
  kind: "hub",
  children: [
    {
      id: "policies",
      title: "Policies",
      kind: "legal-doc",
      legalSource: "terms",
    },
    {
      id: "data-privacy",
      title: "Data and privacy",
      kind: "legal-doc",
      legalSource: "privacy",
    },
    {
      id: "pricing-fees",
      title: "Pricing and fees",
      kind: "faq",
      faqCategory: "Payments",
    },
  ],
};

export const guidesServicesHub: HelpArticle = {
  id: "wavego-services",
  title: "Bull Wave Rides services",
  kind: "hub",
  children: [
    { id: "wavego-delivery", title: "Parcel delivery", kind: "faq", faqCategory: "Parcel" },
    { id: "rentals-faq", title: "Rentals", kind: "faq", faqCategory: "Rental" },
    { id: "safety-faq", title: "Safety", kind: "faq", faqCategory: "Safety" },
  ],
};

export const guidesSupportHub: HelpArticle = {
  id: "support-about",
  title: "Support and about",
  kind: "hub",
  children: [
    { id: "india-support", title: "About India Customer support", kind: "faq", faqCategory: "Support" },
    { id: "faq", title: "Frequently Asked Questions", kind: "faq", faqCategory: "all" },
    {
      id: "careers",
      title: "Careers",
      kind: "content",
      link: { label: "Open careers", href: ROUTES.careers },
      paragraphs: [
        "Open roles are listed on the Careers page. This help topic does not keep a separate job list.",
      ],
    },
  ],
};

export const membershipOverviewHub: HelpArticle = {
  id: "membership-overview",
  title: "Bull Wave Rides Plus",
  kind: "hub",
  children: [
    {
      id: "wavego-plus",
      title: "Bull Wave Rides Plus membership",
      kind: "content",
      paragraphs: [
        "Plus is for frequent riders who want lower fares and faster help.",
      ],
      numberedList: [
        "Open Profile → Subscriptions to see Free, Plus, and Premium.",
        "Paid plans use secure checkout. Free stays at standard rates.",
        "Your active plan shows on the Subscriptions page after payment.",
      ],
      link: { label: "View subscription plans", href: ROUTES.profileSubscription },
    },
    {
      id: "membership-benefits",
      title: "Membership benefits",
      kind: "content",
      paragraphs: [
        "Benefits depend on the plan you select. Typical Plus and Premium perks:",
      ],
      numberedList: [
        "Ride discounts on eligible completed trips.",
        "Priority captain matching during busy hours.",
        "Faster support when you open a help ticket.",
      ],
      link: { label: "Compare plans", href: ROUTES.profileSubscription },
    },
    {
      id: "cancel-membership",
      title: "Cancel or change membership",
      kind: "content",
      paragraphs: [
        "You can switch back to Free or pick another plan from Subscriptions.",
      ],
      numberedList: [
        "Open Subscriptions and tap the plan you want.",
        "Paid-to-Free changes apply at the end of the current billing cycle when the server confirms it.",
        "If checkout fails, try again or contact support with the order details.",
      ],
      link: { label: "Manage membership", href: ROUTES.profileSubscription },
    },
  ],
};

export const accessibilityResourcesHub: HelpArticle = {
  id: "accessibility-resources",
  title: "Accessibility resources",
  kind: "hub",
  children: [
    {
      id: "riders-with-disabilities",
      title: "Resources for riders with disabilities",
      kind: "content",
      paragraphs: [
        "Request extra help at pickup or an accessible cab where the fleet allows it.",
      ],
      numberedList: [
        "Add a note for the captain on the booking screen (gate, ramp, or extra time).",
        "Prefer Cab for more space. Bike is not suitable with a wheelchair.",
        "If a captain cannot assist, cancel without walking to an unsafe spot and contact support.",
      ],
      link: { label: "Open account settings", href: ROUTES.profileAccountSettings },
    },
    {
      id: "screen-readers",
      title: "Using TalkBack and VoiceOver",
      kind: "content",
      paragraphs: [
        "Bull Wave Rides works with TalkBack on Android and VoiceOver on iPhone.",
      ],
      numberedList: [
        "Turn on your device screen reader before opening the app.",
        "Pickup, drop, fare, and captain status are labeled for reading aloud.",
        "If a control is not announced, report it from Support messages.",
      ],
      link: { label: "Contact support", href: ROUTES.profileHelpMessages },
    },
  ],
};

export const reportMapProblemHelp: HelpArticle = {
  id: "report-map-problem",
  title: "Report a problem in the Bull Wave Rides map",
  kind: "report-form",
  paragraphs: [
    "Use this when the in-app map shows the wrong pickup pin, drop pin, or suggested route.",
  ],
  numberedList: [
    "Open Home and search the same place again to confirm it still looks wrong.",
    "Note the address or landmark you typed and what the map showed instead.",
    "Describe the issue below. Include area, city, and nearby roads if you can.",
    "Submit the report — our map team reviews corrections in order.",
  ],
  link: { label: "Open map to check a location", href: ROUTES.location },
};

export const businessLandmarkHelp: HelpArticle = {
  id: "business-landmark",
  title: "Fix a business or landmark issue on Bull Wave Rides Maps",
  kind: "report-form",
  paragraphs: [
    "Use this when a shop, office, hospital, or landmark is missing, misspelled, or pinned in the wrong place.",
  ],
  numberedList: [
    "Search the business or landmark on Home or Location.",
    "Write the correct name, plus the road and area (for example Okhla Phase 3, New Delhi).",
    "Mention if the pin is too far from the actual entrance or gate.",
    "Submit the correction so captains can find the place more easily.",
  ],
  link: { label: "Search a place on the map", href: ROUTES.location },
};

export const incorrectAddressHelp: HelpArticle = {
  id: "incorrect-address",
  title: "Fix an incorrect address on Bull Wave Rides Maps",
  kind: "report-form",
  paragraphs: [
    "Use this when a saved or searched address does not match the building, plot, or entrance on the ground.",
  ],
  numberedList: [
    "Copy the address exactly as it appears in the app.",
    "Write the correct house/plot number, society, or building name.",
    "Add a nearby landmark the captain can use (gate, metro, or mall).",
    "Submit the report. You can also update Saved places for your own pins.",
  ],
  link: { label: "Manage saved places", href: ROUTES.profileSavedPlaces },
};

export const roadInfoHelp: HelpArticle = {
  id: "road-info",
  title: "Fix road information on Bull Wave Rides Maps",
  kind: "report-form",
  paragraphs: [
    "Use this for closed roads, one-way mistakes, missing streets, or routes that send captains the wrong way.",
  ],
  numberedList: [
    "Name the road or junction (and the city / area).",
    "Say what is wrong: closed, one-way, no-entry, missing street, or wrong turn.",
    "Add when you noticed it (date or time of day helps).",
    "Submit the report so routing can be reviewed.",
  ],
  link: { label: "Open map", href: ROUTES.location },
};

export const mapIssueArticles: HelpArticle[] = [
  reportMapProblemHelp,
  businessLandmarkHelp,
  incorrectAddressHelp,
  roadInfoHelp,
];

/** @deprecated Topics now live at section level. */
export const mapIssuesHub: HelpArticle = {
  id: "map-issues",
  title: "Report a map issue",
  kind: "hub",
  children: mapIssueArticles,
};

/** Flat transit topics — no nested hub (avoids empty intermediate pages). */
export const delhiMetroHelp: HelpArticle = {
  id: "delhi-metro",
  title: "Delhi Metro",
  kind: "content",
  paragraphs: [
    "Use Bull Wave Rides for first- and last-mile trips to metro stations across Delhi NCR.",
  ],
  numberedList: [
    "Open Home and set your pickup near your current location.",
    "Set the drop to your metro station entrance or exit gate.",
    "Choose Bike, Auto, or Cab based on distance and luggage.",
    "Share your live trip with family from Safety tools if you are travelling late.",
  ],
  link: {
    label: "Book a ride to the metro",
    href: "/home",
  },
};

export const trainsHelp: HelpArticle = {
  id: "trains",
  title: "Trains",
  kind: "content",
  paragraphs: [
    "Book connecting rides to and from railway stations so you reach your platform on time.",
  ],
  numberedList: [
    "Set pickup or drop to your railway station (for example New Delhi, Hazrat Nizamuddin, or Anand Vihar).",
    "Add a note for the captain with your entrance, platform area, or coach number if needed.",
    "Prefer scheduling the ride a little before your train departure or arrival.",
    "If a captain cannot find you, call from the trip screen and share a nearby landmark.",
  ],
  link: {
    label: "Book a ride to the station",
    href: "/home",
  },
};

export const intercityBusHelp: HelpArticle = {
  id: "intercity-bus",
  title: "Intercity Bus",
  kind: "content",
  paragraphs: [
    "Reach intercity bus terminals with a reliable last-mile ride from Bull Wave Rides.",
  ],
  numberedList: [
    "Search your bus terminal as the drop location (for example Kashmere Gate or Anand Vihar ISBT).",
    "Leave extra time for terminal security checks and boarding queues.",
    "Use Cab if you have heavy luggage; Bike or Auto for lighter trips.",
    "Need help with a past terminal trip? Contact support with your booking details.",
  ],
  link: {
    label: "Book a ride to the bus terminal",
    href: "/home",
  },
};

/** @deprecated Prefer delhiMetroHelp / trainsHelp / intercityBusHelp at section level. */
export const transitHub: HelpArticle = {
  id: "transit-options",
  title: "Transit options",
  kind: "hub",
  children: [delhiMetroHelp, trainsHelp, intercityBusHelp],
};

export const cancellationHub: HelpArticle = {
  id: "cancellation-help",
  title: "Cancellation help",
  kind: "hub",
  children: [
    {
      id: "cancelling-a-ride",
      title: "Cancelling a ride",
      kind: "content",
      paragraphs: [
        "You can cancel from the booking or tracking screen before the trip is completed.",
      ],
      numberedList: [
        "Free cancellation is available within 2 minutes of booking, or before a captain is assigned.",
        "After a captain is assigned, a fee may apply based on vehicle type and wait time.",
        "If the captain cancels, you are not charged. Check Activity for refund status.",
        "Ambulance SOS follows a separate emergency policy — contact support right away.",
      ],
      link: { label: "Open bookings", href: ROUTES.activity },
    },
  ],
};

export const passesHub: HelpArticle = {
  id: "ride-passes",
  title: "Ride Passes",
  kind: "hub",
  children: [
    {
      id: "commute-pass",
      title: "Commute Pass",
      kind: "content",
      paragraphs: [
        "Ride passes apply a discount on eligible daily trips when a pass is active on your account.",
      ],
      numberedList: [
        "Open Wallet or Subscriptions to see if a pass is available in your city.",
        "After purchase, the pass applies automatically on eligible Bike, Auto, or Cab trips.",
        "If a pass did not apply, open the trip in Activity and contact support with the trip ID.",
      ],
      link: { label: "Open wallet", href: ROUTES.wallet },
    },
  ],
};

export const grievanceHub: HelpArticle = {
  id: "grievance-help",
  title: "Grievance redressal",
  kind: "hub",
  children: [
    {
      id: "grievance-redressal",
      title: "Grievance Redressal",
      kind: "content",
      paragraphs: [
        "Use this when a trip, payment, or safety issue was not resolved through normal help tickets.",
      ],
      numberedList: [
        "Open Support messages and include your trip ID, date, and what went wrong.",
        "Our team aims to respond within 48 hours on open tickets.",
        "If it stays unresolved, ask to escalate to the Grievance Officer in the same thread.",
      ],
      link: { label: "Open support messages", href: ROUTES.profileHelpMessages },
    },
  ],
};
