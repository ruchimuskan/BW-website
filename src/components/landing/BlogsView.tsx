"use client";

import { ResilientImage } from "@/components/brand/ResilientImage";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { blogCategories, blogPosts, type BlogCategory } from "@/data/blogs";
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

export function BlogsView() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | "All">(
    "All",
  );

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return blogPosts;
    return blogPosts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  return (
    <MarketingPageShell>
      <LandingHeader />

      <section className="relative overflow-hidden border-b border-[#eef5d4] bg-[#f8faf2] px-4 py-12 sm:px-6 sm:py-16">
        <AnimateIn className="relative z-10 mx-auto max-w-6xl">
          <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#7a8450] sm:text-[11px]">
            Insights
          </p>
          <div className="mt-2 h-px w-12 bg-gradient-to-r from-[#B8D926] to-transparent" />
          <h1 className="mt-4 font-heading text-[1.85rem] font-semibold tracking-tight text-[#38471B] min-[400px]:text-[2rem] sm:text-4xl lg:text-[2.75rem]">
            Stories, updates &amp; insights
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[#4a5228] sm:text-base">
            Company news, product launches, safety guides, and captain stories from
            the team building India&apos;s trusted mobility platform.
          </p>
        </AnimateIn>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div
            className="flex flex-wrap gap-2"
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
                    "rounded-full border px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-200 sm:text-sm",
                    selected
                      ? "border-[#C6E31A] bg-[#C6E31A] text-[#111411] shadow-[0_10px_24px_-14px_rgba(17,20,17,0.28)]"
                      : "border-[#e8eed8] bg-white text-[#4a5228] hover:border-[#dce8a8] hover:text-[#38471B]",
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <Stagger className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <StaggerItem key={post.slug} index={index}>
                <Link
                  href={blogPostPath(post.slug)}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#e8eed8] bg-white shadow-[0_18px_40px_-28px_rgba(40,54,20,0.22)] transition-all duration-200 hover:-translate-y-1 hover:border-[#dce8a8] hover:shadow-[0_22px_48px_-24px_rgba(40,54,20,0.28)] sm:rounded-2xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f4f6ee]">
                    <ResilientImage
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      quality={85}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={cn(
                        BRAND_PHOTO_CLASS,
                        "transition-transform duration-500 group-hover:scale-[1.03]",
                      )}
                    />
                    <BrandImageOverlay variant="card" />
                  </div>
                  <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#f4f6ee] px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-[#6b7344]">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#5a6330]/80">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <h2 className="mt-3 font-heading text-lg font-semibold leading-snug tracking-tight text-[#38471B] transition-colors group-hover:text-[#283614]">
                      {post.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-[13px] font-light leading-relaxed text-[#4a5228]">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#eef5d4] pt-3 text-[11px] text-[#5a6330]/85">
                      <span>{formatDate(post.date)}</span>
                      <span className="inline-flex items-center gap-1 font-semibold tracking-wide uppercase text-[#38471B]">
                        Read
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          {filteredPosts.length === 0 ? (
            <p className="mt-12 text-center text-sm text-[#4a5228]">
              No posts in this category yet. Check back soon.
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-[#eef5d4] bg-[#f8faf2] px-4 py-12 sm:px-6 sm:py-16">
        <AnimateIn className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#38471B] px-6 py-10 shadow-[0_24px_48px_-28px_rgba(40,54,20,0.45)] sm:rounded-3xl sm:px-10 sm:py-12">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#D4E88A]/90">
            Next step
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ride with confidence
          </h2>
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/80 sm:text-base">
            Explore safety tools, book a premium ride, or partner as a captain.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`${ROUTES.landing}#book`}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#C6E31A] px-6 text-sm font-semibold text-[#111411] shadow-sm transition hover:bg-[#D4F04A]"
            >
              Book a ride
            </Link>
            <Link
              href={ROUTES.safety}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
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
