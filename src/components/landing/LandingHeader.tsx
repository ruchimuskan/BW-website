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
  if (pathname === ROUTES.landing) {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash && landingNavLinks.some((link) => link.href === hash)) {
      return hash;
    }
    return ROUTES.landing;
  }
  return ROUTES.landing;
}

type LandingHeaderProps = {
  variant?: "default" | "luxury";
};

export function LandingHeader({ variant = "default" }: LandingHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>(ROUTES.landing);
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const downloadButtonClass = luxury
    ? "bg-[#C8E84A] text-[#0b0614] hover:bg-[#d4f06a]"
    : undefined;

  return (
    <>
      <div
        aria-hidden
        className="h-[calc(5rem+env(safe-area-inset-top,0px))] shrink-0 lg:h-[calc(5.75rem+env(safe-area-inset-top,0px))]"
      />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300",
          luxury
            ? scrolled
              ? "border-[rgba(200,232,74,0.2)] bg-[#0b0614]/95 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)]"
              : "border-transparent bg-[#0b0614]/90"
            : scrolled
              ? "border-[#B8D926]/15 bg-white/95 shadow-[0_12px_32px_-18px_rgba(56,71,27,0.28)]"
              : "border-[#B8D926]/10 bg-white/95",
        )}
      >
        <div
          className={cn(
            landingShell(
              "flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-4",
            ),
            scrolled ? "h-[4.5rem] lg:h-[5.25rem]" : "h-[5rem] lg:h-[5.75rem]",
          )}
        >
          <Link
            href={logoHref}
            onClick={() => handleNavClick(logoHref)}
            className="flex min-w-0 shrink-0 items-center transition-opacity hover:opacity-90"
            aria-label="Bull Wave Rides home"
          >
            <WaveGoLogo
              size="sm"
              priority
              variant={luxury ? "light" : "default"}
              className={cn(
                "transition-[height,width] duration-300",
                scrolled
                  ? "h-14 w-14 sm:h-16 sm:w-16 lg:h-[4.25rem] lg:w-[4.25rem]"
                  : "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] lg:h-20 lg:w-20",
              )}
            />
          </Link>

          <nav
            className="mx-auto hidden min-w-0 items-center lg:flex"
            aria-label="Primary"
          >
            <div
              className={cn(
                "flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                luxury
                  ? "border-white/10 bg-white/5"
                  : "border-[#B8D926]/12 bg-[#f7fbe8]/80",
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
                      "whitespace-nowrap rounded-full px-2.5 py-1.5 text-[12px] font-semibold tracking-tight transition-colors xl:px-3.5 xl:text-[13px]",
                      luxury
                        ? active
                          ? "bg-[#C8E84A] text-[#0b0614]"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                        : active
                          ? "bg-[#B8D926] text-[#38471B] shadow-[0_6px_14px_-8px_rgba(184,217,38,0.9)]"
                          : "text-[#38471B]/75 hover:bg-white hover:text-[#38471B]",
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
            className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2"
            suppressHydrationWarning
          >
            {loggedIn ? (
              <Link
                href={ROUTES.home}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden h-9 gap-1.5 px-3 font-semibold xl:inline-flex",
                  luxury
                    ? "text-white hover:bg-white/10 hover:text-[#C8E84A]"
                    : "text-primary hover:bg-primary/10",
                )}
              >
                <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                Dashboard
              </Link>
            ) : null}

            <LandingAccountChip
              luxury={luxury}
              className="hidden sm:inline-flex"
            />
            <LandingAccountChip
              luxury={luxury}
              layout="icon"
              className="sm:hidden"
            />

            <DownloadAppMenu
              compact
              className="sm:hidden"
              buttonClassName={downloadButtonClass}
            />
            <DownloadAppMenu
              className="hidden sm:inline-flex"
              buttonClassName={downloadButtonClass}
            />

            <button
              type="button"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors active:scale-95 lg:hidden",
                luxury
                  ? "border border-white/25 bg-white/10 text-white hover:border-[#C8E84A] hover:bg-white/15"
                  : "border border-[#B8D926]/30 bg-white text-[#38471B] shadow-[0_6px_16px_-10px_rgba(184,217,38,0.55)] hover:border-[#B8D926] hover:bg-[#B8D926] hover:text-[#38471B]",
                mobileMenuOpen &&
                  (luxury
                    ? "border-[#C8E84A] bg-[#C8E84A]/15"
                    : "border-[#B8D926] bg-[#B8D926]"),
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
              ? "border-white/10 bg-[#0b0614] text-white"
              : "border-[#B8D926]/15 bg-white",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "h-1 w-full shrink-0",
              luxury
                ? "bg-gradient-to-r from-[#C8E84A] to-transparent"
                : "bg-gradient-to-r from-[#B8D926] via-[#C8E84A] to-transparent",
            )}
          />
          <SheetHeader
            className={cn(
              "shrink-0 border-b px-4 py-3.5 text-left sm:px-5",
              luxury ? "border-white/10" : "border-[#B8D926]/12",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <WaveGoLogo
                  size="sm"
                  variant={luxury ? "light" : "default"}
                  className="h-14 w-14 sm:h-16 sm:w-16"
                />
                <SheetDescription
                  className={cn(
                    "mt-1 text-xs",
                    luxury ? "text-white/65" : "text-[#4a5228]",
                  )}
                >
                  Explore Bull Wave Rides
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
                    : "border border-[#B8D926]/20 text-[#38471B] hover:bg-[#B8D926]/15",
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
                "mb-5 h-11 w-full justify-center gap-2 rounded-full text-sm font-semibold shadow-[0_12px_28px_-16px_rgba(184,217,38,0.55)]",
                luxury && "bg-[#C8E84A] text-[#0b0614] hover:bg-[#d4f06a]",
              )}
            >
              Book a Ride
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>

            <nav aria-label="Mobile navigation">
              <p
                className={cn(
                  "mb-2 px-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
                  luxury ? "text-white/50" : "text-[#4a5228]/70",
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
                              ? "bg-white/10 text-[#C8E84A]"
                              : "text-white/90 hover:bg-white/8"
                            : active
                              ? "bg-[#B8D926]/15 text-[#38471B]"
                              : "text-[#38471B] hover:bg-[#f7fbe8]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
                            active
                              ? luxury
                                ? "border-[#C8E84A]/40 bg-[#C8E84A]/20 text-[#C8E84A]"
                                : "border-[#B8D926]/40 bg-[#B8D926] text-[#38471B]"
                              : luxury
                                ? "border-white/12 bg-white/5 text-white/80"
                                : "border-[#B8D926]/15 bg-white text-[#B8D926]",
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
                  luxury ? "border-white/10" : "border-[#B8D926]/12",
                )}
              >
                <Link
                  href={ROUTES.login}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-[48px] items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors active:scale-[0.99]",
                    luxury
                      ? "border-white/20 text-white hover:bg-white/10"
                      : "border-[#B8D926]/30 text-[#38471B] hover:bg-[#B8D926]/12",
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
                  luxury ? "border-white/10" : "border-[#B8D926]/12",
                )}
              >
                <Link
                  href={ROUTES.home}
                  onClick={closeMobile}
                  className={cn(
                    "flex min-h-[48px] items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors active:scale-[0.99]",
                    luxury
                      ? "text-white hover:bg-white/10"
                      : "text-primary hover:bg-primary/8",
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
              luxury ? "border-white/10 bg-white/[0.03]" : "border-[#B8D926]/12 bg-[#f7fbe8]/70",
            )}
          >
            <p
              className={cn(
                "mb-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase",
                luxury ? "text-white/50" : "text-[#4a5228]/70",
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
                    : "border-[#B8D926]/20 bg-white hover:bg-[#B8D926]/10",
                )}
              >
                <Smartphone
                  className={cn("h-4 w-4", luxury ? "text-[#C8E84A]" : "text-primary")}
                />
                <span className="text-[11px] font-semibold leading-tight">Android</span>
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
                    : "border-[#B8D926]/20 bg-white hover:bg-[#B8D926]/10",
                )}
              >
                <Apple
                  className={cn("h-4 w-4", luxury ? "text-[#C8E84A]" : "text-primary")}
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
