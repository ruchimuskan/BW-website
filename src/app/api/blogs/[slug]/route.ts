import { NextResponse } from "next/server";
import { fetchBlogPost } from "@/lib/blog-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const post = await fetchBlogPost(slug);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(
    { post },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
