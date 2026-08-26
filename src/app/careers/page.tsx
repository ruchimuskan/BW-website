import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Careers removed from public navigation — keep URL friendly. */
export default function CareersPage() {
  redirect(ROUTES.about);
}
