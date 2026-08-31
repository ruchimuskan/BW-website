"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  List,
  MapPinned,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { ROUTES } from "@/constants/routes";
import { helpShell } from "@/lib/help-shell";
import { cn } from "@/lib/utils";

export function HelpBreadcrumb({
  sectionTitle,
  sectionId,
  parentTitle,
  parentId,
}: {
  sectionTitle?: string;
  sectionId?: string;
  parentTitle?: string;
  parentId?: string;
  /** @deprecated Kept for callers; theme is always light now. */
  light?: boolean;
}) {
  const linkClass =
    "font-medium text-[#4A5824] underline-offset-2 transition-colors hover:text-[#283614] hover:underline";
  const sepClass = "text-[#5a6330]/35";

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs sm:mb-5 sm:gap-2 sm:text-sm">
      <Link href={ROUTES.profileHelp} className={linkClass}>
        Help
      </Link>
      {sectionTitle && sectionId && (
        <>
          <span className={sepClass}>/</span>
          <Link href={`/profile/help/${sectionId}`} className={linkClass}>
            {sectionTitle}
          </Link>
        </>
      )}
      {parentTitle && parentId && sectionId && (
        <>
          <span className={sepClass}>/</span>
          <Link
            href={`/profile/help/${sectionId}/${parentId}`}
            className={linkClass}
          >
            {parentTitle}
          </Link>
        </>
      )}
    </nav>
  );
}

export function HelpArticleRow({
  title,
  href,
  icon: Icon = List,
  onClick,
}: {
  title: string;
  href?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  const className = cn(
    "group flex w-full items-center gap-3.5 rounded-xl border border-[#e5e7df] bg-white px-3.5 py-3.5 text-left",
    "shadow-[0_1px_2px_rgba(40,54,20,0.04)] transition-all duration-200",
    "hover:border-[#c9d4a8] hover:bg-[#fafaf7] hover:shadow-[0_8px_24px_-16px_rgba(40,54,20,0.22)]",
    "active:scale-[0.997] sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-4",
  );

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#38471B] text-[#C8E84A] transition-colors group-hover:bg-[#283614] sm:h-11 sm:w-11">
        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
      </div>
      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-[#283614] sm:text-[15px]">
        {title}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#8a9270] transition-transform group-hover:translate-x-0.5 group-hover:text-[#38471B]" />
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

interface HelpTopicShellProps {
  title: string;
  breadcrumb?: {
    sectionTitle: string;
    sectionId: string;
    parentTitle?: string;
    parentId?: string;
  };
  children: React.ReactNode;
  /** @deprecated Both variants use the professional light theme now. */
  variant?: "primary" | "light";
  hideTitle?: boolean;
  subtitle?: string;
  backHref?: string;
}

export function HelpTopicShell({
  title,
  breadcrumb,
  children,
  hideTitle = false,
  subtitle,
  backHref,
}: HelpTopicShellProps) {
  const router = useRouter();
  const isSafetyTopic = /safety|emergency|sos/i.test(
    `${title} ${breadcrumb?.sectionTitle ?? ""}`,
  );

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f5f6f2] text-[#283614]">
      <header className="sticky top-0 z-40 border-b border-[#e5e7df] bg-[#283614] text-white shadow-[0_8px_24px_-18px_rgba(40,54,20,0.55)]">
        <div className={helpShell("flex items-center gap-3 py-3 sm:gap-4 sm:py-3.5")}>
          <button
            type="button"
            onClick={() => {
              if (backHref) router.push(backHref);
              else router.back();
            }}
            className={cn(
              "group flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11",
              "border border-white/15 bg-white/10 text-white",
              "transition-all duration-200 hover:bg-white/15 active:scale-[0.96]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8E84A]/50",
            )}
            aria-label="Go back"
          >
            <ArrowLeft
              className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-0.5"
              strokeWidth={2.25}
            />
          </button>
          <WaveGoLogo size="sm" variant="light" className="!h-9 !w-9 sm:!h-10 sm:!w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold tracking-tight text-white sm:text-base">
              Help &amp; support
            </p>
            <p className="truncate text-[11px] text-white/60 sm:text-xs">
              Bull Wave Rides
            </p>
          </div>
        </div>
        <div className="h-[2px] w-full bg-gradient-to-r from-[#9BB820] via-[#C8E84A] to-transparent" />
      </header>

      <section className="relative w-full flex-1 pb-16 pt-5 sm:pb-20 sm:pt-7">
        <div className={helpShell("min-w-0")}>
          <HelpBreadcrumb
            sectionTitle={breadcrumb?.sectionTitle}
            sectionId={breadcrumb?.sectionId}
            parentTitle={breadcrumb?.parentTitle}
            parentId={breadcrumb?.parentId}
          />

          {!hideTitle && (
            <div className="mb-6 max-w-3xl sm:mb-8">
              {isSafetyTopic ? (
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-md border border-[#d9dece] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A5824]">
                  <ShieldAlert className="h-3.5 w-3.5 text-[#38471B]" strokeWidth={2.25} />
                  Safety center
                </div>
              ) : null}
              <h1 className="break-words font-heading text-[1.45rem] font-bold leading-[1.15] tracking-tight text-[#1f2912] sm:text-3xl lg:text-[2.15rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#5a6330] sm:text-[15px]">
                  {subtitle}
                </p>
              ) : null}
            </div>
          )}

          <div className={cn("max-w-3xl", !hideTitle && "mt-1")}>{children}</div>
        </div>
      </section>
    </div>
  );
}

export function articleIcon(title: string): LucideIcon {
  const key = title.toLowerCase();
  if (key.includes("phone")) return Smartphone;
  if (key.includes("policy") || key.includes("privacy")) return FileText;
  if (key.includes("emergency") || key.includes("safety") || key.includes("sos")) {
    return ShieldAlert;
  }
  if (key.includes("map") || key.includes("road") || key.includes("address") || key.includes("landmark")) {
    return MapPinned;
  }
  return List;
}
