"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import { resolveBlogCover, type BlogPost } from "@/data/blogs";
import { ROUTES } from "@/constants/routes";
import { blogPostPath } from "@/lib/blog-routes";

function formatDate(iso: string) {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogArticleView({
  post,
  related = [],
}: {
  post: BlogPost;
  related?: BlogPost[];
}) {

  return (
    <MarketingPageShell>
      <LandingHeader />

      <article className="border-b border-[#e8edd8] bg-[#f7f8f3]">
        <div className="mx-auto max-w-3xl px-4 pb-14 pt-8 sm:px-6 sm:pb-16 sm:pt-10">
          <nav aria-label="Breadcrumb" className="text-[12px] text-[#8a9184]">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link
                  href={ROUTES.blogs}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#38471B] transition-colors hover:text-[#111411]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  All stories
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="uppercase tracking-[0.14em] text-[#5a7a12]">
                {post.category}
              </li>
            </ol>
          </nav>

          <header className="mt-6">
            <h1 className="font-heading text-[1.55rem] font-semibold leading-[1.15] tracking-tight text-[#111411] sm:text-4xl lg:text-[2.55rem]">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#5A6158]">
              <span>{post.author}</span>
              {post.date ? (
                <>
                  <span aria-hidden>·</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </>
              ) : null}
              {post.readTime ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {post.readTime}
                  </span>
                </>
              ) : null}
            </div>
          </header>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-[#e8edd8] bg-[#eef2e0]">
            <ResilientImage
              src={resolveBlogCover(post)}
              alt={post.imageAlt || post.title}
              fill
              quality={NEXT_IMAGE_QUALITY.high}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              fallbackSrc="/images/blogs/cities.jpg"
            />
          </div>

          <div className="mt-10 space-y-5 text-[15px] leading-[1.75] text-[#3d4438] sm:text-base sm:leading-[1.8]">
            {post.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 64)}>{paragraph}</p>
            ))}
          </div>

          {related.length > 0 ? (
            <aside className="mt-14 border-t border-[#e8edd8] pt-8">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#5a7a12] uppercase">
                More stories
              </p>
              <ul className="mt-4 space-y-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={blogPostPath(item.slug)}
                      prefetch
                      className="group flex min-h-12 items-center justify-between gap-3 rounded-xl bg-white px-4 py-3.5 ring-1 ring-[#e8edd8] transition-colors hover:ring-[#C6E31A]/70 sm:gap-4"
                    >
                      <span className="min-w-0 font-heading text-[14px] font-semibold leading-snug tracking-tight text-[#111411] group-hover:text-[#283614] sm:text-[15px]">
                        {item.title}
                      </span>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-[#111411] transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </div>
      </article>

      <LandingFooter />
    </MarketingPageShell>
  );
}
