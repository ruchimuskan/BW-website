"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { NEXT_IMAGE_QUALITY } from "@/constants/images";
import {
  blogCategories,
  resolveBlogCover,
  type BlogCategory,
  type BlogPost,
} from "@/data/blogs";
import { ROUTES } from "@/constants/routes";
import { blogPostPath } from "@/lib/blog-routes";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  const parsed = new Date(iso);
  if (!iso || Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogsView({ posts = [] }: { posts?: BlogPost[] }) {
  const [livePosts, setLivePosts] = useState<BlogPost[]>(posts);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "All">(
    "All",
  );

  useEffect(() => {
    setLivePosts(posts);
  }, [posts]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/blogs", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { posts?: BlogPost[] };
        if (!cancelled && Array.isArray(json.posts)) {
          setLivePosts(json.posts);
        }
      } catch {
        // Keep the last good payload if the API is waking up.
      }
    };

    void load();
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(() => void load(), 45_000);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, []);

  const filteredPosts = useMemo(() => {
    const usable = livePosts.filter((post) => Boolean(post.slug?.trim()));
    if (activeCategory === "All") return usable;
    return usable.filter((post) => post.category === activeCategory);
  }, [activeCategory, livePosts]);

  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  return (
    <MarketingPageShell>
      <LandingHeader />

      <section className="border-b border-[#e8edd8] bg-white px-4 py-8 sm:px-6 sm:py-11 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-[#5a7a12] uppercase">
            Insights
          </p>
          <div className="mt-2 h-1 w-10 rounded-full bg-[#C6E31A]" />
          <h1 className="mt-3 font-heading text-[1.7rem] font-semibold tracking-tight text-[#111411] sm:text-4xl">
            Stories &amp; updates
          </h1>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-[#5A6158] sm:text-base">
            Product notes, safety guides, and captain stories from the BW Rides
            team.
          </p>
        </div>
      </section>

      <section className="bg-[#f7f8f3] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
            role="tablist"
            aria-label="Blog categories"
          >
            {(["All", ...blogCategories] as const).map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 sm:text-sm",
                    selected
                      ? "border-[#C6E31A] bg-[#C6E31A] text-[#111411]"
                      : "border-[#e8edd8] bg-white text-[#5A6158] hover:border-[#C6E31A]/40 hover:text-[#111411]",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {featured ? (
            <Link
              href={blogPostPath(featured.slug)}
              prefetch
              scroll
              className="group relative z-10 mt-7 grid overflow-hidden rounded-2xl border border-[#e8edd8] bg-white shadow-[0_16px_36px_-28px_rgba(27,58,34,0.28)] transition-all duration-300 hover:border-[#C6E31A]/45 sm:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
            >
              <div className="relative aspect-[16/10] min-h-[180px] bg-[#eef2e0] sm:aspect-auto sm:min-h-[240px]">
                <ResilientImage
                  src={resolveBlogCover(featured)}
                  alt={featured.imageAlt || featured.title}
                  fill
                  quality={NEXT_IMAGE_QUALITY.high}
                  sizes="(max-width: 639px) 94vw, 480px"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  fallbackSrc="/images/blogs/cities.jpg"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center px-5 py-5 sm:px-7 sm:py-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8a9184]">
                  <span className="rounded-full bg-[#eef2e0] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#5a7a12] uppercase">
                    {featured.category}
                  </span>
                  {featured.date ? (
                    <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="mt-3 font-heading text-xl font-semibold leading-snug tracking-tight text-[#111411] group-hover:text-[#283614] sm:text-[1.65rem]">
                  {featured.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#5A6158] sm:text-sm">
                  {featured.excerpt}
                </p>
                <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full bg-[#C6E31A] px-4 py-2 text-[11px] font-semibold tracking-[0.12em] text-[#111411] uppercase">
                  Read article
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>
            </Link>
          ) : null}

          {rest.length > 0 ? (
            <div className="relative z-10 mt-4 divide-y divide-[#e8edd8] overflow-hidden rounded-2xl border border-[#e8edd8] bg-white">
              {rest.map((post) => (
                <Link
                  key={post.slug}
                  href={blogPostPath(post.slug)}
                  prefetch
                  scroll
                  className="group flex min-h-[4.5rem] items-start justify-between gap-3 px-4 py-4 transition-colors hover:bg-[#f7f8f3] sm:gap-4 sm:px-6 sm:py-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8a9184]">
                      <span className="font-semibold tracking-[0.12em] text-[#5a7a12] uppercase">
                        {post.category}
                      </span>
                      {post.date ? (
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      ) : null}
                    </div>
                    <h2 className="mt-1.5 font-heading text-[1.02rem] font-semibold leading-snug tracking-tight text-[#111411] group-hover:text-[#283614] sm:text-lg">
                      {post.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[#5A6158]">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold tracking-[0.12em] text-[#111411] uppercase">
                    Read
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              ))}
            </div>
          ) : null}

          {filteredPosts.length === 0 ? (
            <p className="mt-12 text-center text-sm text-[#5A6158]">
              Stories will appear here once they are published on the server.
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-[#e8edd8] bg-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-[#111411] px-5 py-9 sm:rounded-3xl sm:px-10 sm:py-11">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#C6E31A] uppercase">
            Next step
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ride with confidence
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Explore safety tools, book a ride, or partner as a captain.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <Link
              href={`${ROUTES.landing}#book`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#C6E31A] px-6 text-sm font-semibold text-[#111411] transition hover:bg-[#d4f04a]"
            >
              Book a ride
            </Link>
            <Link
              href={ROUTES.safety}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Safety
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </MarketingPageShell>
  );
}
