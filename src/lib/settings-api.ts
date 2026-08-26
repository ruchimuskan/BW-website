import { apiFetch } from "@/lib/api";

export interface LegalDocument {
  title: string;
  content: string;
}

function asLegalDocument(res: unknown, fallbackTitle: string): LegalDocument {
  if (!res || typeof res !== "object") {
    return { title: fallbackTitle, content: "" };
  }
  const row = res as Record<string, unknown>;
  const nested =
    row.data && typeof row.data === "object"
      ? (row.data as Record<string, unknown>)
      : row;
  const content =
    typeof nested.content === "string"
      ? nested.content
      : typeof nested.body === "string"
        ? nested.body
        : typeof nested.html === "string"
          ? nested.html
          : "";
  const title =
    typeof nested.title === "string" && nested.title.trim()
      ? nested.title
      : fallbackTitle;
  return { title, content };
}

export function getPrivacyPolicy(): Promise<LegalDocument> {
  return apiFetch<unknown>(
    "/api/v1/public/privacy-policy",
    { skipAuth: true },
    "Unable to load privacy policy",
  ).then((res) => asLegalDocument(res, "Privacy Policy"));
}

export function getTermsAndConditions(): Promise<LegalDocument> {
  return apiFetch<unknown>(
    "/api/v1/public/terms",
    { skipAuth: true },
    "Unable to load terms",
  ).then((res) => asLegalDocument(res, "Terms of Service"));
}

export function getAboutUs(): Promise<Record<string, string>> {
  return apiFetch<Record<string, string>>(
    "/api/v1/public/about",
    { skipAuth: true },
    "Unable to load about info",
  );
}
