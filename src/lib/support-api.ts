import { apiFetch, authFetch } from "@/lib/api";
import { triggerRideSos } from "@/lib/ride-api";

export interface FaqItem {
  id?: string;
  category: string;
  question: string;
  answer: string;
}

function unwrapFaqList(res: unknown): FaqItem[] {
  const raw = Array.isArray(res)
    ? res
    : res && typeof res === "object" && Array.isArray((res as { data?: unknown }).data)
      ? ((res as { data: unknown[] }).data)
      : [];
  const items: FaqItem[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const question = String(item.question ?? "").trim();
    const answer = String(item.answer ?? "").trim();
    if (!question || !answer) continue;
    items.push({
      id: typeof item.id === "string" ? item.id : undefined,
      category: String(item.category ?? "General"),
      question,
      answer,
    });
  }
  return items;
}

export function getFaqs(): Promise<FaqItem[]> {
  return apiFetch<unknown>(
    "/api/v1/common/support/faqs",
    { skipAuth: true },
    "Unable to load FAQs",
  ).then(unwrapFaqList);
}

export interface SupportTicketMessage {
  id?: string;
  sender?: string;
  message: string;
  created_at?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  messages?: SupportTicketMessage[];
}

export function createSupportTicket(payload: {
  subject: string;
  message: string;
  category?: string;
  ride_id?: string;
  attachment?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}): Promise<SupportTicket> {
  return authFetch<SupportTicket>(
    "/support",
    {
      method: "POST",
      body: JSON.stringify({
        subject: payload.subject,
        message: payload.message,
        category: payload.category,
        ride_id: payload.ride_id ?? null,
        attachment: payload.attachment ?? null,
        priority: payload.priority ?? null,
      }),
    },
    "Unable to create support ticket"
  );
}

export function getSupportTickets(): Promise<SupportTicket[]> {
  return authFetch<{ data?: SupportTicket[] } | SupportTicket[]>(
    "/support/tickets",
    undefined,
    "Unable to load tickets"
  ).then((res) => (Array.isArray(res) ? res : res.data ?? []));
}

export function getSupportTicket(ticketId: string): Promise<SupportTicket> {
  return authFetch<SupportTicket>(
    `/support/tickets/${ticketId}`,
    undefined,
    "Unable to load ticket"
  );
}

/** Prefer ride-scoped SOS so admin/driver get the same alerts as the app. */
export function triggerSos(payload: {
  ride_id?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
}) {
  if (!payload.ride_id) {
    return Promise.reject(new Error("SOS requires an active ride"));
  }
  return triggerRideSos(payload.ride_id, {
    lat: payload.latitude,
    lng: payload.longitude,
    message: payload.message,
  });
}
