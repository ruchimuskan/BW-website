"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Apple,
  ArrowRight,
  BookOpen,
  Building2,
  Car,
  ChevronRight,
  Home,
  Info,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  Smartphone,
  Siren,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DownloadAppMenu } from "@/components/landing/DownloadAppMenu";
import { LandingAccountChip } from "@/components/landing/LandingAccountChip";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { landingNavLinks } from "@/constants/services";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";
import { landingShell } from "@/lib/landing-shell";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const navIcons: Record<string, LucideIcon> = {
  [ROUTES.landing]: Home,
  [ROUTES.ride]: Car,
  [ROUTES.about]: Info,
  [ROUTES.safety]: ShieldCheck,
  [ROUTES.corporateRegister]: Building2,
  [ROUTES.sos]: Siren,
  [ROUTES.captains]: Users,
  [ROUTES.blogs]: BookOpen,
};

function getActiveFromUrl(pathname: string) {
  if (pathname === ROUTES.about) return ROUTES.about;
  if (pathname === ROUTES.safety) return ROUTES.safety;
  if (pathname === ROUTES.sos) return ROUTES.sos;
  if (pathname === ROUTES.captains) return ROUTES.captains;
  if (pathname === ROUTES.ride) return ROUTES.ride;
  if (pathname === ROUTES.download) return ROUTES.download;
  if (pathname === ROUTES.corporateRegister) return ROUTES.corporateRegister;
  if (pathname === ROUTES.blogs || pathname.startsWith(`${ROUTES.blogs}/`)) {
    return ROUTES.blogs;
  }
  if (
    pathname === ROUTES.privacy ||
    pathname === ROUTES.terms ||
    pathname.startsWith("/legal/")
  ) {
    return "";
  }
  if (pathname === ROUTES.landing) {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash && landingNavLinks.some((link) => link.href === hash)) {
      return hash;
    }
    return ROUTES.landing;
  }
  return "";
}

type LandingHeaderProps = {
  variant?: "default" | "luxury";
};

export function LandingHeader({ variant = "default" }: LandingHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(() => getActiveFromUrl(pathname));
  const [scrolled, setScrolled] = useState(false);
  const { loggedIn } = useIsAuthenticated();
  const luxury = variant === "luxury";
  const logoHref = loggedIn ? ROUTES.home : ROUTES.landing;
  const bookRideHref = loggedIn ? ROUTES.home : ROUTES.ride;

  useEffect(() => {
    setActiveNav(getActiveFromUrl(pathname));
    const onHashChange = () => setActiveNav(getActiveFromUrl(pathname));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Close drawer when viewport crosses desktop breakpoint. */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const resolveHref = (href: string) => {
    if (href.startsWith("#") && pathname !== ROUTES.landing) {
      return `${ROUTES.landing}${href}`;
    }
    return href;
  };

  const isActive = (href: string) => activeNav === href;

  const handleNavClick = (href: string) => {
    setActiveNav(href);
    setMobileMenuOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const downloadButtonClass =
    "bg-[#C6E31A] text-[#1B3A22] hover:bg-[#D4F04A] shadow-[0_8px_20px_-12px_rgba(27,58,34,0.35)]";

  return (
    <>
      <div
        aria-hidden
        className="h-[calc(4.15rem+env(safe-area-inset-top,0px))] shrink-0 md:h-[calc(4.4rem+env(safe-area-inset-top,0px))]"
      />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] overflow-x-clip border-b pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,border-color] duration-200",
          luxury
            ? scrolled
              ? "border-white/10 bg-[#1B3A22] shadow-[0_12px_28px_-18px_rgba(20,48,26,0.65)]"
              : "border-transparent bg-[#1B3A22]/96"
            : scrolled
              ? "border-[#D4D8D0] bg-white/98 shadow-[0_10px_28px_-18px_rgba(27,58,34,0.18)] backdrop-blur-md"
              : "border-[#E4E7E0] bg-[#F4F5F2]/92 backdrop-blur-sm",
        )}
      >
        {/* Brand lime rail */}
        <div
          aria-hidden
          className="h-[3px] w-full bg-gradient-to-r from-[#C6E31A] via-[#9BB820] to-[#C6E31A]"
        />

        <div
          className={cn(
            landingShell(
              "flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-4",
            ),
            "h-[3.85rem] md:h-[4.15rem]",
          )}
        >
          <Link
            href={logoHref}
            onClick={() => handleNavClick(logoHref)}
            className="flex min-w-0 shrink-0 items-center transition-opacity hover:opacity-90"
            aria-label="BW Rides home"
          >
            <WaveGoLogo
              size="sm"
              priority
              withWordmark
              variant={luxury ? "light" : "default"}
              className="[&>span:first-child]:h-10 [&>span:first-child]:w-10 sm:[&>span:first-child]:h-11 sm:[&>span:first-child]:w-11 lg:[&>span:first-child]:h-10 lg:[&>span:first-child]:w-10 xl:[&>span:first-child]:h-11 xl:[&>span:first-child]:w-11"
            />
          </Link>

          {/* Desktop / tablet landscape — inline nav (never scrollable) */}
          <nav
            className="mx-auto hidden min-w-0 flex-1 items-center justify-center px-0.5 lg:flex"
            aria-label="Primary"
          >
            <div
              className={cn(
                "flex max-w-full items-center justify-center gap-px rounded-full border px-1 py-0.5 xl:gap-0.5 xl:px-1.5 xl:py-1",
                luxury
                  ? "border-white/12 bg-white/8"
                  : "border-[#D4D8D0] bg-white/90 shadow-[0_6px_18px_-14px_rgba(27,58,34,0.2)]",
              )}
            >
              {landingNavLinks.map((link) => {
                const href =
                  link.href === ROUTES.ride ? bookRideHref : link.href;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={resolveHref(href)}
                    onClick={() => handleNavClick(link.href)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-1.5 py-1 text-[10px] font-semibold tracking-tight transition-colors lg:px-2 lg:py-1.5 lg:text-[11px] xl:px-2.5 xl:text-[12px] 2xl:px-3.5 2xl:text-[13px]",
                      luxury
                        ? active
                          ? "bg-[#C6E31A] text-[#1B3A22]"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                        : active
                          ? "bg-[#C6E31A] text-[#1B3A22] shadow-[0_4px_14px_-6px_rgba(198,227,26,0.7)]"
                          : "text-[#1B3A22]/75 hover:bg-[#F4F5F2] hover:text-[#1B3A22]",
                    )}
                  >
                    <span className="xl:hidden">{link.shortLabel}</span>
                    <span className="hidden xl:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div
            className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-1.5 lg:gap-1.5 xl:gap-2"
            suppressHydrationWarning
          >
            {loggedIn ? (
              <>
                <LandingAccountChip
                  luxury={luxury}
                  layout="icon"
                  className="hidden lg:inline-flex xl:hidden"
                />
                <LandingAccountChip
                  luxury={luxury}
                  compact
                  className="hidden xl:inline-flex"
                />
              </>
            ) : (
              <>
                <LandingAccountChip
                  luxury={luxury}
                  className="hidden sm:inline-flex lg:hidden"
                />
                <LandingAccountChip
                  luxury={luxury}
                  className="hidden lg:inline-flex"
                />
                <LandingAccountChip
                  luxury={luxury}
                  layout="icon"
                  className="sm:hidden"
                />
              </>
            )}

            <DownloadAppMenu
              compact
              className="hidden min-[380px]:inline-flex xl:hidden"
              buttonClassName={downloadButtonClass}
            />
            <DownloadAppMenu
              className="hidden xl:inline-flex"
              buttonClassName={cn(
                downloadButtonClass,
                "h-9 px-4 text-[12px] 2xl:h-10 2xl:px-5 2xl:text-[13px]",
              )}
            />

            {/* Mobile / small tablet — sidebar menu only below lg */}
            <button
              type="button"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95 sm:h-10 sm:w-10 lg:hidden",
                luxury
                  ? "border border-white/25 bg-white/10 text-white hover:border-[#C6E31A]"
                  : "border border-[#D4D8D0] bg-white text-[#1B3A22] hover:border-[#C6E31A] hover:bg-[#C6E31A]/15",
                mobileMenuOpen &&
                  (luxury
                    ? "border-[#C6E31A] bg-[#C6E31A]/15"
                    : "border-[#C6E31A] bg-[#C6E31A] text-[#1B3A22]"),
              )}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="landing-mobile-nav"
            >
              {mobileMenuOpen ? (
                <X className="h-[18px] w-[18px]" strokeWidth={2} />
              ) : (
                <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          id="landing-mobile-nav"
          side="right"
          showCloseButton={false}
          className={cn(
            "flex w-[min(100vw-0.75rem,22rem)] flex-col gap-0 border-l p-0 sm:max-w-sm",
            luxury
              ? "border-white/10 bg-[#1B3A22] text-white"
              : "border-[#E4E7E0] bg-white",
          )}
        >
          <div aria-hidden className="h-[3px] w-full shrink-0 bg-[#C6E31A]" />
          <SheetHeader
            className={cn(
              "shrink-0 border-b px-4 py-3.5 text-left sm:px-5",
              luxury ? "border-white/10" : "border-[#E4E7E0] bg-[#F4F5F2]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <WaveGoLogo
                  size="sm"
                  withWordmark
                  variant={luxury ? "light" : "default"}
                  className="[&>span:first-child]:h-11 [&>span:first-child]:w-11"
                />
                <SheetDescription
                  className={cn(
                    "mt-1.5 text-xs",
                    luxury ? "text-white/65" : "text-[#5A7A5E]",
                  )}
                >
                  Explore BW Rides
                </SheetDescription>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Close menu"
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors active:scale-95",
                  luxury
                    ? "border border-white/20 text-white hover:bg-white/10"
                    : "border border-[#D4D8D0] text-[#1B3A22] hover:bg-[#C6E31A]/15",
                )}
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
            {loggedIn ? (
              <div className="mb-4">
                <LandingAccountChip
                  luxury={luxury}
                  layout="card"
                  onNavigate={closeMobile}
                />
              </div>
            ) : null}

            <Link
              href={bookRideHref}
              onClick={() => handleNavClick(ROUTES.ride)}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mb-5 h-11 w-full justify-center gap-2 rounded-full bg-[#C6E31A] text-sm font-semibold text-[#1B3A22] shadow-[0_10px_24px_-12px_rgba(27,58,34,0.35)] hover:bg-[#D4F04A]",
              )}
            >
              Book a Ride
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>

            <nav aria-label="Mobile navigation">
              <p
                className={cn(
                  "mb-2 px-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
                  luxury ? "text-white/50" : "text-[#5A7A5E]",
                )}
              >
                Explore
              </p>
              <ul className="space-y-1">
                {landingNavLinks.map((link) => {
                  const href =
                    link.href === ROUTES.ride ? bookRideHref : link.href;
                  const Icon = navIcons[link.href] ?? ChevronRight;
                  const active = isActive(link.href);
                  return (
                    <li key={link.label}>
                      <Link
                        href={resolveHref(href)}
                        onClick={() => handleNavClick(link.href)}
                        className={cn(
                          "flex min-h-[48px] items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors",
                          luxury
                            ? active
                              ? "bg-white/10 text-[#C6E31A]"
                              : "text-white/90 hover:bg-white/8"
                            : active
                              ? "bg-[#C6E31A]/20 text-[#1B3A22]"
                              : "text-[#1B3A22] hover:bg-[#F4F5F2]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                            active
                              ? luxury
                                ? "border-[#C6E31A]/40 bg-[#C6E31A]/20 text-[#C6E31A]"
                                : "border-[#C6E31A] bg-[#C6E31A] text-[#1B3A22]"
                              : luxury
                                ? "border-white/12 bg-white/5 text-white/80"
                                : "border-[#E4E7E0] bg-white text-[#1B3A22]",
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">
                          {link.label}
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 opacity-35",
                            active && "opacity-70",
                          )}
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {!loggedIn ? (
              <div
                className={cn(
                  "mt-5 border-t pt-4",
                  luxury ? "border-white/10" : "border-[#E4E7E0]",
                )}
              >
                <Link
                  href={ROUTES.login}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-[48px] items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors active:scale-[0.99]",
                    luxury
                      ? "border-white/20 text-white hover:bg-white/10"
                      : "border-[#1B3A22]/20 text-[#1B3A22] hover:bg-[#C6E31A]/12",
                  )}
                >
                  Sign in to your account
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            ) : (
              <div
                className={cn(
                  "mt-5 border-t pt-4",
                  luxury ? "border-white/10" : "border-[#E4E7E0]",
                )}
              >
                <Link
                  href={ROUTES.home}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-[48px] items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors active:scale-[0.99]",
                    luxury
                      ? "text-white hover:bg-white/10"
                      : "text-[#1B3A22] hover:bg-[#F4F5F2]",
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />
                  Go to Dashboard
                  <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                </Link>
              </div>
            )}
          </div>

          <div
            className={cn(
              "shrink-0 border-t px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5",
              luxury
                ? "border-white/10 bg-white/[0.03]"
                : "border-[#E4E7E0] bg-[#F4F5F2]",
            )}
          >
            <p
              className={cn(
                "mb-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase",
                luxury ? "text-white/50" : "text-[#5A7A5E]",
              )}
            >
              Download app
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={APP_DOWNLOAD.androidApkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                className={cn(
                  "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 text-center transition-colors active:scale-[0.98]",
                  luxury
                    ? "border-white/15 bg-white/8 hover:bg-white/12"
                    : "border-[#E4E7E0] bg-white hover:border-[#C6E31A] hover:bg-[#C6E31A]/12",
                )}
              >
                <Smartphone
                  className={cn(
                    "h-4 w-4",
                    luxury ? "text-[#C6E31A]" : "text-[#1B3A22]",
                  )}
                />
                <span className="text-[11px] font-semibold leading-tight">
                  Android
                </span>
              </a>
              <a
                href={APP_DOWNLOAD.iosAppStoreUrl || "#"}
                target={APP_DOWNLOAD.iosAppStoreUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!APP_DOWNLOAD.iosAppStoreUrl) {
                    e.preventDefault();
                    window.alert("iOS app link will be available soon.");
                  } else {
                    closeMobile();
                  }
                }}
                className={cn(
                  "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 text-center transition-colors active:scale-[0.98]",
                  luxury
                    ? "border-white/15 bg-white/8 hover:bg-white/12"
                    : "border-[#E4E7E0] bg-white hover:border-[#C6E31A] hover:bg-[#C6E31A]/12",
                )}
              >
                <Apple
                  className={cn(
                    "h-4 w-4",
                    luxury ? "text-[#C6E31A]" : "text-[#1B3A22]",
                  )}
                />
                <span className="text-[11px] font-semibold leading-tight">iOS</span>
              </a>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
