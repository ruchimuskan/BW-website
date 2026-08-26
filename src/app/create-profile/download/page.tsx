import { redirect } from "next/navigation";
import { ROUTES } from "@/constants/routes";

/** Legacy path — download page lives at /download */
export default function CreateProfileDownloadRedirect() {
  redirect(ROUTES.download);
}
