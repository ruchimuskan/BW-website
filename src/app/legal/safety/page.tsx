import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/**
 * Legacy URL — Safety policy lives on the main Safety page (`/safety`).
 * Keep this route so old footer/bookmarks still resolve without a duplicate page.
 */
export default function LegalSafetyRedirectPage() {
  redirect(ROUTES.safety);
}
