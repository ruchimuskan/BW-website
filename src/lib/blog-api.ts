import { apiFetch } from "@/lib/api";
import {
  blogPosts as curatedBlogPosts,
  getBlogPost as getCuratedBlogPost,
  type BlogPost,
} from "@/data/blogs";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapList(res: unknown): unknown[] {
  if (Array.isArray(res)) return res;
  const row = asRecord(res);
  const nested = row?.data ?? row?.items ?? row?.results ?? row?.blogs;
  if (Array.isArray(nested)) return nested;
  return [];
}

function parsePost(value: unknown): BlogPost | null {
  const row = asRecord(value);
  if (!row) return null;
  const slug = String(row.slug ?? row.id ?? "").trim();
  const title = String(row.title ?? "").trim();
  if (!slug || !title) return null;
  const paragraphs = Array.isArray(row.paragraphs)
    ? row.paragraphs.map((p) => String(p))
    : String(row.body ?? row.content ?? row.excerpt ?? "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
  return {
    slug,
    title,
    excerpt: String(row.excerpt ?? row.summary ?? paragraphs[0] ?? "").trim(),
    category: (String(row.category ?? "Company") as BlogPost["category"]) || "Company",
    date: String(row.published_at ?? row.date ?? row.created_at ?? "").slice(0, 10),
    readTime: String(row.read_time ?? row.readTime ?? "4 min read"),
    image: String(row.image_url ?? row.image ?? "/images/landing/brand/lime-cab.png"),
    imageAlt: String(row.image_alt ?? row.imageAlt ?? title),
    author: String(row.author ?? row.author_name ?? "BW Rides"),
    paragraphs: paragraphs.length ? paragraphs : [title],
  };
}

async function fetchFromBackend(): Promise<BlogPost[]> {
  const paths = ["/api/v1/common/blogs", "/api/v1/public/blogs"];
  for (const path of paths) {
    try {
      const res = await apiFetch<unknown>(
        path,
        { skipAuth: true },
        "Unable to load blogs",
      );
      const parsed = unwrapList(res)
        .map(parsePost)
        .filter((row): row is BlogPost => Boolean(row));
      if (parsed.length > 0) return parsed;
    } catch {
      // try next path
    }
  }
  return [];
}

/** Live CMS blogs when the API publishes them; otherwise editorial catalog. */
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const live = await fetchFromBackend().catch(() => []);
  return live.length > 0 ? live : curatedBlogPosts;
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | undefined> {
  const live = await fetchFromBackend().catch(() => []);
  const match = live.find((post) => post.slug === slug);
  if (match) return match;
  return getCuratedBlogPost(slug);
}
