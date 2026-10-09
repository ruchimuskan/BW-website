import { absoluteUrl } from "@/constants/seo";
import { getApiBaseUrl } from "@/lib/api";
import { rememberPublic } from "@/lib/public-cache";
import {
  resolveBlogCover,
  withoutDummyClaims,
  type BlogCategory,
  type BlogPost,
} from "@/data/blogs";

const LIST_PATHS = [
  "/api/v1/common/blogs",
  "/api/v1/public/blogs",
  "/api/v1/common/cms/blogs",
];

const WRITE_PATHS = [
  "/api/v1/common/blogs",
  "/api/v1/public/blogs",
  "/api/v1/admin/blogs",
  "/api/v1/common/cms/blogs",
];

const CATEGORIES = new Set<BlogCategory>([
  "Company",
  "Safety",
  "Captains",
  "Product",
  "Community",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapList(res: unknown): unknown[] {
  if (Array.isArray(res)) return res;
  const row = asRecord(res);
  const nested = row?.data ?? row?.items ?? row?.results ?? row?.blogs ?? row?.posts;
  if (Array.isArray(nested)) return nested;
  return [];
}

function asCategory(value: unknown): BlogCategory {
  const label = String(value ?? "").trim();
  return CATEGORIES.has(label as BlogCategory)
    ? (label as BlogCategory)
    : "Company";
}

function serviceHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const token =
    process.env.BACKEND_ADMIN_TOKEN?.trim() ||
    process.env.BLOG_API_TOKEN?.trim() ||
    process.env.BACKEND_SERVICE_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function backendFetch(
  path: string,
  init?: RequestInit,
  timeoutMs = 12_000,
): Promise<{ ok: boolean; status: number; json: unknown }> {
  const url = `${getApiBaseUrl().replace(/\/$/, "")}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        ...serviceHeaders(),
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
    let json: unknown = null;
    const text = await response.text();
    if (text) {
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        json = { raw: text };
      }
    }
    return { ok: response.ok, status: response.status, json };
  } catch {
    return { ok: false, status: 0, json: null };
  } finally {
    clearTimeout(timer);
  }
}

export function parsePost(value: unknown): BlogPost | null {
  const row = asRecord(value);
  if (!row) return null;
  const nested = asRecord(row.data) ?? row;
  const slug = String(nested.slug ?? nested.id ?? "").trim();
  const title = String(nested.title ?? nested.headline ?? "").trim();
  if (!slug || !title) return null;
  const paragraphs = Array.isArray(nested.paragraphs)
    ? nested.paragraphs.map((p) => String(p))
    : String(nested.body ?? nested.content ?? nested.excerpt ?? "")
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
  const parsed: BlogPost = {
    slug,
    title,
    excerpt: String(
      nested.excerpt ?? nested.summary ?? paragraphs[0] ?? "",
    ).trim(),
    category: asCategory(nested.category),
    date: String(
      nested.published_at ?? nested.date ?? nested.created_at ?? "",
    ).slice(0, 10),
    readTime: String(nested.read_time ?? nested.readTime ?? "4 min read"),
    image: String(nested.image_url ?? nested.image ?? nested.cover ?? ""),
    imageAlt: String(nested.image_alt ?? nested.imageAlt ?? title),
    author: String(nested.author ?? nested.author_name ?? "BW Rides"),
    paragraphs: paragraphs.length ? paragraphs : [title],
  };
  parsed.image = resolveBlogCover(parsed);
  return withoutDummyClaims(parsed);
}

function toWriteBody(post: BlogPost) {
  const content = post.paragraphs.join("\n\n");
  const image = post.image.startsWith("http")
    ? post.image
    : absoluteUrl(post.image);
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    summary: post.excerpt,
    category: post.category,
    body: content,
    content,
    paragraphs: post.paragraphs,
    image,
    image_url: image,
    image_alt: post.imageAlt,
    author: post.author,
    author_name: post.author,
    read_time: post.readTime,
    published_at: post.date,
    date: post.date,
    status: "published",
    is_published: true,
    published: true,
  };
}

async function fetchFromBackend(): Promise<{
  posts: BlogPost[];
  reachable: boolean;
}> {
  return rememberPublic(
    "blogs-list",
    async () => {
      const results = await Promise.all(
        LIST_PATHS.map((path) => backendFetch(path, { method: "GET" }, 2_500)),
      );
      let reachable = false;
      for (const res of results) {
        if (res.status === 0) continue;
        reachable = true;
        if (!res.ok) continue;
        const parsed = unwrapList(res.json)
          .map(parsePost)
          .filter((row): row is BlogPost => Boolean(row));
        if (parsed.length > 0) return { posts: parsed, reachable: true };
      }
      return { posts: [] as BlogPost[], reachable };
    },
    {
      ttlMs: 60_000,
      emptyTtlMs: 8_000,
      isEmpty: (value) => value.posts.length === 0,
    },
  );
}

async function fetchOneFromBackend(slug: string): Promise<BlogPost | undefined> {
  const encoded = encodeURIComponent(slug);
  const paths = [
    `/api/v1/common/blogs/${encoded}`,
    `/api/v1/public/blogs/${encoded}`,
    `/api/v1/common/blogs?slug=${encoded}`,
    `/api/v1/public/blogs?slug=${encoded}`,
  ];
  for (const path of paths) {
    const res = await backendFetch(path, { method: "GET" }, 2_500);
    if (res.status === 0) continue;
    if (!res.ok) continue;
    const fromList = unwrapList(res.json)
      .map(parsePost)
      .find((row) => row?.slug === slug);
    if (fromList) return fromList;
    const direct = parsePost(res.json);
    if (direct && (direct.slug === slug || unwrapList(res.json).length === 0)) {
      return direct;
    }
  }
  return undefined;
}

async function writePost(post: BlogPost): Promise<boolean> {
  const body = JSON.stringify(toWriteBody(post));
  for (const path of WRITE_PATHS) {
    const created = await backendFetch(path, { method: "POST", body }, 8_000);
    if (created.ok || created.status === 409) return true;
    if (created.status === 0 || created.status === 503) return false;
    if (created.status === 401 || created.status === 403) continue;
    const updated = await backendFetch(
      `${path}/${encodeURIComponent(post.slug)}`,
      { method: "PUT", body },
      8_000,
    );
    if (updated.ok || updated.status === 409) return true;
    if (updated.status === 0 || updated.status === 503) return false;
  }
  return false;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const live = await fetchFromBackend().catch(() => ({
    posts: [] as BlogPost[],
    reachable: false,
  }));
  return live.posts;
}

export async function fetchBlogPost(
  slug: string,
): Promise<BlogPost | undefined> {
  const list = await fetchBlogPosts().catch(() => [] as BlogPost[]);
  const fromList = list.find((post) => post.slug === slug);
  if (fromList) return fromList;
  return fetchOneFromBackend(slug).catch(() => undefined);
}

export async function createBlogOnBackend(
  post: BlogPost,
): Promise<BlogPost | undefined> {
  const written = await writePost(post);
  if (!written) return undefined;
  return (await fetchBlogPost(post.slug)) ?? post;
}
