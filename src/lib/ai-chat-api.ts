import { PUBLIC_API, apiFetch } from "@/lib/api";
import { getFaqs, type FaqItem } from "@/lib/support-api";

export type AiChatRole = "user" | "assistant";

export type AiChatMessage = {
  role: AiChatRole;
  content: string;
};

export type AiChatTopicQuestion = {
  id: string;
  label: string;
  question: string;
  answer: string;
};

export type AiChatTopic = {
  id: string;
  label: string;
  questions: AiChatTopicQuestion[];
};

export type AiChatBootstrap = {
  welcome: string;
  topics: AiChatTopic[];
};

type AiChatResponse = {
  reply?: string;
  message?: string;
  data?: {
    reply?: string;
    message?: string;
  };
};

function extractReply(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const row = payload as AiChatResponse;
  const nested = row.data;
  const candidates = [
    row.reply,
    row.message,
    nested?.reply,
    nested?.message,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/** Send a message to Bullwave Assistant (backend `/api/v1/public/ai-chat`). */
export async function sendAiChatMessage(
  message: string,
  history: AiChatMessage[] = [],
): Promise<string> {
  const data = await apiFetch<unknown>(
    `${PUBLIC_API}/ai-chat`,
    {
      method: "POST",
      skipAuth: true,
      timeoutMs: 45_000,
      body: JSON.stringify({
        message,
        history: history.slice(-8).map((item) => ({
          role: item.role,
          content: item.content,
        })),
      }),
    },
    "Could not reach Bullwave Assistant",
  );

  const reply = extractReply(data);
  if (!reply) {
    throw new Error("Bullwave Assistant returned an empty reply");
  }
  return reply;
}

function buildTopicsFromFaqs(faqs: FaqItem[]): AiChatTopic[] {
  const byCategory = new Map<string, FaqItem[]>();
  for (const faq of faqs) {
    const key = (faq.category || "General").trim() || "General";
    const list = byCategory.get(key) ?? [];
    list.push(faq);
    byCategory.set(key, list);
  }

  const topics: AiChatTopic[] = [];
  for (const [category, items] of byCategory) {
    const questions = items.slice(0, 6).map((item, index) => ({
      id: item.id || `${category}-${index}`,
      label:
        item.question.length > 42
          ? `${item.question.slice(0, 40).trim()}…`
          : item.question,
      question: item.question,
      answer: item.answer,
    }));
    if (!questions.length) continue;
    topics.push({
      id: category.toLowerCase().replace(/\s+/g, "-"),
      label: category,
      questions,
    });
  }

  return topics.slice(0, 6);
}

/**
 * Load welcome copy from the AI chat API and quick topics from support FAQs.
 * Both are live backend sources — no local mock answers.
 */
export async function fetchAiChatBootstrap(): Promise<AiChatBootstrap> {
  const [welcomeResult, faqsResult] = await Promise.allSettled([
    sendAiChatMessage(
      "Introduce yourself briefly as Bullwave Assistant and list what you can help riders with.",
    ),
    getFaqs(),
  ]);

  const topics =
    faqsResult.status === "fulfilled"
      ? buildTopicsFromFaqs(faqsResult.value)
      : [];

  if (welcomeResult.status === "rejected" && topics.length === 0) {
    throw new Error("Could not load Bullwave Assistant");
  }

  const welcome =
    welcomeResult.status === "fulfilled"
      ? welcomeResult.value
      : topics.length > 0
        ? `Hi — I’m Bullwave Assistant.\n\nBrowse ${topics.map((t) => t.label).join(", ")} below, or type your question.`
        : "";

  if (!welcome) {
    throw new Error("Could not load Bullwave Assistant");
  }

  return { welcome, topics };
}
