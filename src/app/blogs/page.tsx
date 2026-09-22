import type { Metadata } from "next";
import { BlogsView } from "@/components/landing/BlogsView";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { fetchBlogPosts } from "@/lib/blog-api";
import { pageMetadata } from "@/lib/page-metadata";

const page = SITE_LINK_PAGES.find((p) => p.path === "/blogs")!;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
});

export default async function BlogsPage() {
  const posts = await fetchBlogPosts();
  return <BlogsView posts={posts} />;
}
