import { helpSectionPath } from "@/lib/help-routes";

export interface HelpTopic {
  id: string;
  label: string;
  route: string;
}

/** Help hub navigation — routes into static/CMS help articles (not mock trip data). */
export const helpTopics: HelpTopic[] = [
  { id: "safety", label: "Safety & emergency", route: helpSectionPath("safety-emergency") },
  { id: "trip", label: "Help with a trip", route: helpSectionPath("trip") },
  { id: "account", label: "Account", route: helpSectionPath("account") },
  { id: "membership", label: "Membership", route: helpSectionPath("membership") },
  { id: "accessibility", label: "Accessibility", route: helpSectionPath("accessibility") },
  { id: "grievance", label: "Grievance redressal", route: helpSectionPath("grievance") },
  { id: "guides", label: "Guides", route: helpSectionPath("guides") },
  { id: "transit", label: "Bus, Metro, and Train", route: helpSectionPath("transit") },
  { id: "cancellation", label: "Cancellation policy", route: helpSectionPath("cancellation") },
  { id: "map", label: "Map issue", route: helpSectionPath("map") },
  { id: "passes", label: "Ride Passes", route: helpSectionPath("passes") },
];
