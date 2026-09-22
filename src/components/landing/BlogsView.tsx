"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { BRAND_PHOTOS } from "@/constants/brand-images";
import { blogCategories, blogPosts as defaultBlogPosts, type BlogCategory, type BlogPost } from "@/data/blogs";
import { ROUTES } from "@/constants/routes";
import { blogPostPath } from "@/lib/blog-routes";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogsView({ posts = defaultBlogPosts }: { posts?: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "All">(
    "All",
  );

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  return (
    <MarketingPageShell>
      <LandingHeader />

      <section className="relative overflow-hidden border-b border-[#e8edd8] bg-[#f7f8f3] px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_0%_0%,rgba(198,227,26,0.14),transparent_60%)]"
        />
        <AnimateIn className="relative z-10 mx-auto max-w-6xl">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-[#5a7a12] uppercase sm:text-[11px]">
            Insights
          </p>
          <div className="mt-2.5 h-1 w-10 rounded-full bg-[#C6E31A] sm:w-12" />
          <h1 className="mt-3 max-w-3xl font-heading text-[1.75rem] font-semibold tracking-tight text-[#111411] sm:mt-4 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
            Stories, updates &amp; insights
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[#5A6158] sm:mt-4 sm:text-base">
            Company news, product launches, safety guides, and captain stories
            from the team building India&apos;s trusted mobility platform.
          </p>
        </AnimateIn>
      </section>

      <section className="bg-white px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-6xl">
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
                    "shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 sm:text-sm",
                    selected
                      ? "border-[#C6E31A] bg-[#C6E31A] text-[#111411] shadow-[0_10px_24px_-14px_rgba(17,20,17,0.28)]"
                      : "border-[#e8edd8] bg-white text-[#5A6158] hover:border-[#C6E31A]/40 hover:text-[#111411]",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <Stagger className="mt-7 grid grid-cols-1 gap-4 sm:mt-9 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {filteredPosts.map((post, index) => (
              <StaggerItem key={post.slug} index={index}>
                <Link
                  href={blogPostPath(post.slug)}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8edd8] bg-gradient-to-b from-[#f7f9f0] to-white shadow-[0_16px_36px_-28px_rgba(27,58,34,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-[#C6E31A]/45 hover:shadow-[0_22px_44px_-24px_rgba(27,58,34,0.35)]"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-[#eef2e0]">
                    <ResilientImage
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      quality={88}
                      sizes="(max-width: 639px) 94vw, (max-width: 1023px) 46vw, 360px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                      style={{
                        objectPosition: post.imagePosition ?? "center center",
                      }}
                      fallbackSrc={BRAND_PHOTOS.streetCab}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111411]/35 via-transparent to-transparent"
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#eef2e0] px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-[#5a7a12] uppercase">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#8a9184]">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="mt-3 line-clamp-2 font-heading text-[1.05rem] font-semibold leading-snug tracking-tight text-[#111411] transition-colors group-hover:text-[#283614] sm:text-lg">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-[#5A6158] sm:text-sm">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-[#eef2e0] pt-3 text-[11px] text-[#8a9184]">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span className="inline-flex items-center gap-1 font-semibold tracking-[0.12em] text-[#111411] uppercase">
                        Read
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          {filteredPosts.length === 0 ? (
            <p className="mt-12 text-center text-sm text-[#5A6158]">
              No posts in this category yet. Check back soon.
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-[#e8edd8] bg-[#f7f8f3] px-4 py-10 sm:px-6 sm:py-14">
        <AnimateIn className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#111411] px-5 py-9 sm:rounded-3xl sm:px-10 sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[#C6E31A]/20 blur-3xl"
          />
          <p className="relative text-[10px] font-semibold tracking-[0.22em] text-[#C6E31A] uppercase">
            Next step
          </p>
          <h2 className="relative mt-2 font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ride with confidence
          </h2>
          <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Explore safety tools, book a premium ride, or partner as a captain.
          </p>
          <div className="relative mt-7 flex flex-col gap-2.5 sm:flex-row sm:gap-3">
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
        </AnimateIn>
      </section>

      <LandingFooter />
    </MarketingPageShell>
  );
}