"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { BrandImageOverlay } from "@/components/brand/BrandImageOverlay";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { getBlogPost, blogPosts } from "@/data/blogs";
import { ROUTES } from "@/constants/routes";
import { blogPostPath } from "@/lib/blog-routes";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface BlogArticleViewProps {
  slug: string;
}

export function BlogArticleView({ slug }: BlogArticleViewProps) {
  const post = getBlogPost(slug);
  if (!post) {
    notFound();
  }

  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 2);

  return (
    <MarketingPageShell>
      <LandingHeader />

      <article className="relative border-b border-[#eef5d4] bg-[#f8faf2] px-4 py-10 sm:px-6 sm:py-14">
        <AnimateIn className="relative z-10 mx-auto max-w-3xl">
          <Link
            href={ROUTES.blogs}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#38471B] transition-colors hover:text-[#5a6330]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all blogs
          </Link>

          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#7a8450]">
            {post.category}
          </p>
          <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#B8D926] to-transparent" />

          <h1 className="mt-4 font-heading text-[1.75rem] font-semibold leading-tight tracking-tight text-[#38471B] sm:text-4xl lg:text-[2.5rem]">
            {post.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#4a5228]">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(post.date)}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-[#e8edd8] bg-[#eef2e0] shadow-[0_20px_48px_-28px_rgba(40,54,20,0.28)] sm:rounded-2xl">
            <Image
              src={post.image}
              alt={post.imageAlt}
              fill
              quality={90}
              className="object-cover"
              style={{ objectPosition: post.imagePosition ?? "center center" }}
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
            <BrandImageOverlay variant="subtle" />
          </div>

          <div className="mt-10 space-y-5 text-sm font-light leading-relaxed text-[#4a5228] sm:text-base lg:text-lg">
            {post.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </AnimateIn>

        {related.length > 0 ? (
          <AnimateIn className="mx-auto mt-14 max-w-3xl border-t border-[#eef5d4] pt-10">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#7a8450]">
              Related
            </p>
            <Stagger className="mt-4 space-y-3">
              {related.map((item, index) => (
                <StaggerItem key={item.slug} index={index}>
                  <Link
                    href={blogPostPath(item.slug)}
                    className="group flex items-start justify-between gap-4 rounded-xl border border-[#e8eed8] bg-white px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#dce8a8] hover:shadow-[0_12px_28px_-20px_rgba(40,54,20,0.22)] sm:rounded-2xl"
                  >
                    <span className="font-heading text-base font-semibold tracking-tight text-[#38471B] group-hover:text-[#283614]">
                      {item.title}
                    </span>
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#38471B]">
                      Read →
                    </span>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </AnimateIn>
        ) : null}
      </article>

      <LandingFooter />
    </MarketingPageShell>
  );
}
