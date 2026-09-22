import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticleView } from "@/components/landing/BlogArticleView";
import { absoluteUrl, SITE_BRAND } from "@/constants/seo";
import { fetchBlogPost, fetchBlogPosts } from "@/lib/blog-api";
import { pageMetadata } from "@/lib/page-metadata";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    return pageMetadata({
      title: `Blog | ${SITE_BRAND}`,
      description: "Company news, product updates, and safety guides from BW Rides.",
      path: "/blogs",
    });
  }

  return pageMetadata({
    title: `${post.title} | ${SITE_BRAND} Blog`,
    description: post.excerpt,
    path: `/blogs/${post.slug}`,
    keywords: [
      SITE_BRAND,
      post.category,
      "BW Rides blog",
      "ride hailing India",
    ],
  });
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(post.image)],
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_BRAND,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/images/bwride.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blogs/${post.slug}`),
    },
    articleSection: post.category,
    inLanguage: "en-IN",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl("/blogs"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: absoluteUrl(`/blogs/${post.slug}`),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogArticleView slug={slug} />
    </>
  );
}
