import { NextResponse } from "next/server";
import {
  createBlogOnBackend,
  fetchBlogPosts,
  parsePost,
} from "@/lib/blog-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const posts = await fetchBlogPosts();
  return NextResponse.json(
    { posts },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

export async function POST(request: Request) {
  const expected =
    process.env.BACKEND_ADMIN_TOKEN?.trim() ||
    process.env.BLOG_API_TOKEN?.trim() ||
    process.env.BACKEND_SERVICE_TOKEN?.trim();
  const auth = request.headers.get("authorization")?.trim() ?? "";
  if (!expected || auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = parsePost(body);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid blog payload" }, { status: 400 });
  }
  const stored = await createBlogOnBackend(parsed);
  if (!stored) {
    return NextResponse.json(
      { error: "Unable to store blog on backend" },
      { status: 502 },
    );
  }
  return NextResponse.json({ post: stored }, { status: 201 });
}
