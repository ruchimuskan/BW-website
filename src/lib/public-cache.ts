/** Short in-memory cache for public catalogs (vehicles, FAQs, blogs). */

type Entry<T> = { at: number; data: T };

const store = new Map<string, Entry<unknown>>();

function isEmptyValue<T>(value: T): boolean {
  return Array.isArray(value) && value.length === 0;
}

export async function rememberPublic<T>(
  key: string,
  loader: () => Promise<T>,
  options?: {
    ttlMs?: number;
    emptyTtlMs?: number;
    isEmpty?: (value: T) => boolean;
  },
): Promise<T> {
  const ttlMs = options?.ttlMs ?? 60_000;
  const emptyTtlMs = options?.emptyTtlMs ?? 8_000;
  const isEmpty = options?.isEmpty ?? isEmptyValue;
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit) {
    const ttl = isEmpty(hit.data) ? emptyTtlMs : ttlMs;
    if (now - hit.at < ttl) return hit.data;
  }
  const data = await loader();
  store.set(key, { at: Date.now(), data });
  return data;
}

export function publicFetchCache(): RequestInit & {
  next?: { revalidate: number };
} {
  if (typeof window === "undefined") {
    return {
      cache: "force-cache",
      next: { revalidate: 60 },
    };
  }
  return { cache: "no-store" };
}
