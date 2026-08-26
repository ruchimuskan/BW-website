"use client";

import {
  X,
  Home,
  CalendarCheck,
  Wallet,
  User,
  HelpCircle,
  FileText,
  ShieldCheck,
  LogOut,
  Smartphone,
  Info,
  Car,
  Siren,
  Users,
  Newspaper,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { logoutCurrentUser } from "@/lib/logout";
import { useAuthUser } from "@/hooks/useAuthUser";
import { UserProfileNameCard } from "@/components/layout/UserProfileNameCard";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Home", href: ROUTES.home, icon: Home },
  { label: "Bookings", href: ROUTES.bookings, icon: CalendarCheck },
  { label: "Wallet", href: ROUTES.wallet, icon: Wallet },
  { label: "Profile", href: ROUTES.profile, icon: User },
  { label: "Support", href: ROUTES.profileHelp, icon: HelpCircle },
  { label: "Terms & Conditions", href: ROUTES.terms, icon: FileText },
] as const;

/** Marketing pages (LandingHeader layout) — open from dashboard sidebar */
const exploreNavItems = [
  { label: "About Us", href: ROUTES.about, icon: Info },
  { label: "Safety", href: ROUTES.safety, icon: ShieldCheck },
  { label: "Book a Ride", href: ROUTES.home, icon: Car },
  { label: "Emergency SOS", href: ROUTES.sos, icon: Siren },
  { label: "Captains", href: ROUTES.captains, icon: Users },
  { label: "Blogs", href: ROUTES.blogs, icon: Newspaper },
] as const;

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthUser();

  useEffect(() => {
    if (!isOpen) return;

    const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDesktop()) onClose();
    };

    document.addEventListener("keydown", onKey);
    if (!isDesktop()) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleLogout = () => {
    void logoutCurrentUser().finally(() => {
      onClose();
      router.push(ROUTES.landing);
    });
  };

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#283614]/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      {/* Drawer on mobile · persistent rail on large screens */}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 left-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(300px,88vw)] flex-col border-r border-primary/10 bg-white shadow-[8px_0_40px_-24px_rgba(40,54,20,0.35)] transition-transform duration-300 ease-out",
          "lg:w-[280px] lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="relative border-b border-primary/10 px-4 py-4 sm:px-5 sm:py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_0%_0%,rgba(200,232,74,0.14),transparent_55%),radial-gradient(ellipse_70%_60%_at_100%_100%,rgba(184,217,38,0.1),transparent_50%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-secondary/15 blur-2xl"
          />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-primary/10 bg-white/80 text-[#4a5228] shadow-sm backdrop-blur-sm transition-colors hover:bg-primary/10 hover:text-primary lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative pr-8 lg:pr-0">
            <UserProfileNameCard user={user} onNavigate={onClose} />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-gutter:stable]">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== ROUTES.home && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => go(item.href)}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors",
                      active
                        ? "bg-[#B8D926] text-[#38471B] shadow-sm shadow-primary/20"
                        : "text-[#4a5228] hover:bg-[#f7fbe8] hover:text-[#38471B]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        active ? "bg-[#38471B]/10 text-[#38471B]" : "bg-[#f7fbe8] text-primary",
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 px-1">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] text-secondary uppercase">
              <Globe className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Explore website
            </p>
            <ul className="space-y-1">
              {exploreNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => go(item.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#4a5228] transition-colors hover:bg-primary/5 hover:text-primary"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="my-4 h-px bg-primary/10" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-[#4a5228] transition-colors hover:bg-destructive/5 hover:text-destructive"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-destructive/8 text-destructive">
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
            </span>
            Logout
          </button>
        </nav>

        <div className="border-t border-primary/10 bg-[#f7fbe8]/80 p-4">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-secondary uppercase">
            Get the apps
          </p>
          <div className="mt-2.5 space-y-2">
            <a
              href={APP_DOWNLOAD.androidPlayStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-[#e8f0c8] bg-white px-3 py-2.5 text-xs font-semibold text-[#38471B] transition hover:border-[#B8D926]/40 hover:bg-white"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#B8D926]" />
              Rider app — Play Store
            </a>
            <a
              href={APP_DOWNLOAD.captainAndroidPlayStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-[#e8f0c8] bg-white px-3 py-2.5 text-xs font-semibold text-[#38471B] transition hover:border-[#B8D926]/40 hover:bg-white"
            >
              <Smartphone className="h-3.5 w-3.5 text-[#B8D926]" />
              Captain app — Play Store
            </a>
            <Link
              href={ROUTES.download}
              onClick={onClose}
              className="flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold text-[#38471B] underline-offset-2 hover:underline"
            >
              Download page
            </Link>
          </div>
          <Link
            href={ROUTES.landing}
            onClick={onClose}
            className="mt-3 block text-center text-[11px] font-medium text-[#4a5228] hover:text-primary"
          >
            Bull Wave Rides website
          </Link>
        </div>
      </aside>
    </>
  );
}
