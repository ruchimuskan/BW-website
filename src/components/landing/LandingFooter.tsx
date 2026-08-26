"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Ambulance,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  MapPinned,
  Package,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { buttonVariants } from "@/components/ui/button";
import { APP_DOWNLOAD } from "@/constants/app-download";
import { ROUTES } from "@/constants/routes";
import { SITE_LINK_PAGES } from "@/constants/seo";
import { getProtectedPath } from "@/lib/auth-session";
import { landingShell } from "@/lib/landing-shell";
import { easeOut, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

const footerFeatures = [
  {
    icon: MapPinned,
    title: "Live tracking",
    description: "Know every mile in real time",
    href: ROUTES.ride,
  },
  {
    icon: ShieldCheck,
    title: "Safety tools",
    description: "Verified captains & trip share",
    href: ROUTES.safety,
  },
  {
    icon: Package,
    title: "Parcel ready",
    description: "Secure same-city deliveries",
    href: `${ROUTES.landing}#book`,
  },
  {
    icon: Ambulance,
    title: "SOS care",
    description: "Emergency ambulance on tap",
    href: ROUTES.sos,
  },
] as const;

const quickTags = [
  { label: "Rides", href: ROUTES.ride },
  { label: "Download", href: ROUTES.download },
  { label: "SOS", href: ROUTES.sos },
  { label: "Captains", href: ROUTES.captains },
] as const;

const exploreLinks = [
  { label: "Book a Ride", href: ROUTES.home, protected: true },
  { label: "Download App", href: ROUTES.download },
  { label: "Become a captain", href: ROUTES.captains },
  { label: "Services", href: "#services" },
  { label: "FAQs", href: "#faqs" },
] as const;

const companyLinks = SITE_LINK_PAGES.filter(
  (page) => page.path !== ROUTES.ride && page.path !== ROUTES.download,
).map((page) => ({
  label: page.name,
  href: page.path,
}));

const legalLinks = [
  { label: "Terms of service", href: ROUTES.terms },
  { label: "Privacy policy", href: ROUTES.privacy },
  { label: "Safety policy", href: ROUTES.legalSafety },
] as const;

const fastReveal = { duration: 0.24, ease: easeOut } as const;
const accordionTransition = { duration: 0.26, ease: easeOut } as const;

function useFooterNavigate() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (href: string, opts?: { protected?: boolean }) => {
      if (href.startsWith("#")) {
        const id = href.slice(1);
        const el = document.getElementById(id);
        if (el) {
          const headerOffset = 88;
          const top =
            el.getBoundingClientRect().top + window.scrollY - headerOffset;
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
          window.history.replaceState(null, "", href);
          return;
        }
        if (pathname !== ROUTES.landing) {
          router.push(`${ROUTES.landing}${href}`);
        }
        return;
      }

      const hashIdx = href.indexOf("#");
      if (hashIdx > 0) {
        const path = href.slice(0, hashIdx);
        const hash = href.slice(hashIdx);
        if (pathname === path || (path === ROUTES.landing && pathname === "/")) {
          const el = document.getElementById(hash.slice(1));
          if (el) {
            const headerOffset = 88;
            const top =
              el.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
            window.history.replaceState(null, "", hash);
            return;
          }
        }
        router.push(href);
        return;
      }

      router.push(opts?.protected ? getProtectedPath(href) : href);
    },
    [pathname, router],
  );
}

function FooterLink({
  href,
  children,
  protected: isProtected,
}: {
  href: string;
  children: ReactNode;
  protected?: boolean;
}) {
  const navigate = useFooterNavigate();
  const reduceMotion = useReducedMotion();
  const [dest, setDest] = useState(href);

  useEffect(() => {
    if (isProtected) setDest(getProtectedPath(href));
  }, [href, isProtected]);

  const className = cn(
    "group relative inline-flex min-h-10 w-full max-w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-[#4a5228]",
    "transition-colors duration-200 hover:bg-primary/[0.05] hover:text-primary active:bg-primary/[0.08]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
    "md:w-fit md:gap-1.5 md:px-0 md:hover:bg-transparent",
  );

  const label = (
    <>
      <span className="relative min-w-0 flex-1 truncate md:flex-none">
        {children}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-primary transition-transform duration-200 ease-out",
            "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100 group-active:scale-x-100",
            reduceMotion && "transition-none",
          )}
        />
      </span>
      <ArrowRight
        aria-hidden
        className={cn(
          "bw-link-arrow h-3.5 w-3.5 shrink-0 text-primary",
          "opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 ease-out",
          "group-hover:translate-x-0 group-hover:opacity-100",
          "group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
          "group-active:translate-x-0.5 group-active:opacity-100",
          reduceMotion && "transition-none group-hover:opacity-100",
        )}
        strokeWidth={2.2}
      />
    </>
  );

  if (href.startsWith("#")) {
    return (
      <motion.a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          navigate(href);
        }}
        className={className}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={transitions.fast}
      >
        {label}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={transitions.fast}
      className="w-full md:w-fit"
    >
      <Link href={dest} prefetch className={className}>
        {label}
      </Link>
    </motion.div>
  );
}

function FooterNavColumn({
  title,
  links,
  open,
  onToggle,
}: {
  title: string;
  links: readonly { label: string; href: string; protected?: boolean }[];
  open: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const navId = `footer-nav-${title.toLowerCase().replace(/\s+/g, "-")}`;

  const linkList = (
    <div className="flex flex-col gap-0.5 pb-2 md:pb-0">
      {links.map((link) => (
        <FooterLink
          key={`${title}-${link.label}`}
          href={link.href}
          protected={"protected" in link ? Boolean(link.protected) : false}
        >
          {link.label}
        </FooterLink>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border border-primary/10 bg-white/70 backdrop-blur-sm transition-colors duration-200 md:rounded-none md:border-0 md:bg-transparent md:backdrop-blur-none",
        open && "border-primary/20 bg-white md:bg-transparent",
      )}
    >
      <motion.button
        type="button"
        onClick={onToggle}
        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        transition={transitions.fast}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:text-primary active:bg-primary/[0.04] md:pointer-events-none md:cursor-default md:px-0 md:py-0 md:pb-3 md:active:bg-transparent"
        aria-expanded={open}
        aria-controls={navId}
      >
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-primary">
          {title}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={accordionTransition}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary md:hidden"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>

      <div id={navId}>
        <nav className="hidden md:block" aria-label={title}>
          {linkList}
        </nav>
        <div className="md:hidden">
          <AnimatePresence initial={false}>
            {open ? (
              <motion.nav
                key={title}
                initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                transition={accordionTransition}
                className="overflow-hidden px-2"
                aria-label={title}
              >
                <motion.div
                  initial={reduceMotion ? false : { y: -6 }}
                  animate={{ y: 0 }}
                  transition={accordionTransition}
                >
                  {linkList}
                </motion.div>
              </motion.nav>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function LandingFooter() {
  const reduceMotion = useReducedMotion();
  const navigate = useFooterNavigate();
  const [openSection, setOpenSection] = useState<string | null>("Explore");

  const toggleSection = useCallback((title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  }, []);

  return (
    <footer className="relative overflow-x-clip border-t border-primary/10 bg-[#f7fbe8]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(200,232,74,0.18),transparent_58%)]"
      />
      {!reduceMotion ? (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-20 top-32 h-52 w-52 rounded-full bg-secondary/20 blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.35, 0.5, 0.35] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-16 bottom-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
            animate={{ scale: [1.05, 1, 1.05], opacity: [0.28, 0.45, 0.28] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}

      {/* CTA band */}
      <div className={landingShell("relative z-10 pt-8 sm:pt-10 lg:pt-12")}>
        <motion.div
          initial={reduceMotion ? false : { y: 14 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={fastReveal}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#38471B] via-[#4a5824] to-[#B8D926] px-5 py-6 shadow-[0_24px_48px_-24px_rgba(40,54,20,0.55)] sm:rounded-3xl sm:px-8 sm:py-7 lg:px-10 lg:py-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(200,232,74,0.35),transparent_55%)]"
          />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:gap-6 lg:flex-row lg:items-center">
            <div className="min-w-0 max-w-xl">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#D4E88A] uppercase sm:text-[11px]">
                Ride with Bull Wave
              </p>
              <h2 className="mt-2 font-heading text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
                Ready for your next journey?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/75 sm:text-[15px]">
                Book in seconds, track live, and travel with verified captains
                across India.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
              <motion.button
                type="button"
                onClick={() => navigate(`${ROUTES.landing}#book`)}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={transitions.spring}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 w-full rounded-full bg-white px-6 text-sm font-semibold text-[#B8D926] hover:bg-[#ffffff] sm:w-auto",
                )}
              >
                Book a ride
                <ArrowUpRight className="h-4 w-4" />
              </motion.button>
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={transitions.spring}
                className="w-full sm:w-auto"
              >
                <Link
                  href={ROUTES.download}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-12 w-full rounded-full border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 sm:w-auto",
                  )}
                >
                  Download app
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Feature strip */}
      <div className={landingShell("relative z-10 pt-6 sm:pt-8")}>
        <motion.div
          initial={reduceMotion ? false : { y: 12 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={fastReveal}
          className="overflow-hidden rounded-2xl border border-primary/12 bg-white/95 shadow-[0_16px_40px_-28px_rgba(184,217,38,0.35)] sm:rounded-3xl"
        >
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {footerFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.title}
                  type="button"
                  onClick={() => navigate(feature.href)}
                  initial={reduceMotion ? false : { y: 10 }}
                  whileInView={{ y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...fastReveal, delay: index * 0.035 }}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  className={cn(
                    "group flex h-full w-full min-w-0 items-start gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-primary/[0.04] active:bg-primary/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/25 sm:gap-3.5 sm:px-5 sm:py-5",
                    index % 2 === 1 &&
                      "min-[480px]:border-l min-[480px]:border-primary/10",
                    index >= 2 &&
                      "border-t border-primary/10 min-[480px]:border-t lg:border-t-0",
                    index > 0 && "lg:border-l lg:border-primary/10",
                    index === 2 && "min-[480px]:border-l-0 lg:border-l",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-all duration-200 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-white group-active:scale-95">
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1 pt-0.5">
                    <span className="block font-heading text-sm font-semibold text-foreground sm:text-[15px]">
                      {feature.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground sm:text-[13px]">
                      {feature.description}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="bw-link-arrow mt-1 h-4 w-4 shrink-0 text-primary opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 group-active:translate-x-0.5 group-active:opacity-100"
                    strokeWidth={2.2}
                  />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Brand + nav */}
      <div className={landingShell("relative z-10 py-9 sm:py-11 lg:py-12")}>
        <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,1.45fr)_repeat(3,minmax(0,1fr))] lg:items-start lg:gap-8 xl:gap-12">
          <motion.div
            className="min-w-0 md:col-span-2 lg:col-span-1"
            initial={reduceMotion ? false : { y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={fastReveal}
          >
            <Link
              href={ROUTES.landing}
              className="inline-flex transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              aria-label="Bull Wave Rides home"
            >
              <WaveGoLogo size="md" className="h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20" />
            </Link>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-muted-foreground sm:text-[15px]">
              Premium rides, smart deliveries, and emergency ambulance — one
              elegant mobility platform for modern India.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {quickTags.map((tag) => (
                <motion.button
                  key={tag.label}
                  type="button"
                  onClick={() => navigate(tag.href)}
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.95 }}
                  transition={transitions.spring}
                  className="inline-flex min-h-9 items-center rounded-full border border-primary/15 bg-white/90 px-3.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-primary shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  {tag.label}
                </motion.button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <motion.a
                href={APP_DOWNLOAD.androidPlayStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={transitions.spring}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/15 bg-white px-4 text-xs font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Rider app
              </motion.a>
              <motion.a
                href={APP_DOWNLOAD.captainAndroidPlayStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={transitions.spring}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/15 bg-white px-4 text-xs font-semibold text-primary transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5"
              >
                <Smartphone className="h-3.5 w-3.5" />
                Captain app
              </motion.a>
            </div>
          </motion.div>

          <div className="flex flex-col gap-2.5 md:contents">
            <FooterNavColumn
              title="Explore"
              links={exploreLinks}
              open={openSection === "Explore"}
              onToggle={() => toggleSection("Explore")}
            />
            <FooterNavColumn
              title="Company"
              links={companyLinks}
              open={openSection === "Company"}
              onToggle={() => toggleSection("Company")}
            />
            <FooterNavColumn
              title="Legal"
              links={legalLinks}
              open={openSection === "Legal"}
              onToggle={() => toggleSection("Legal")}
            />
          </div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { y: 10 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={fastReveal}
          className="mt-9 flex flex-col items-center justify-between gap-3 border-t border-primary/10 pt-5 text-center text-sm text-muted-foreground sm:mt-10 sm:flex-row sm:gap-4 sm:text-left"
        >
          <p className="min-w-0">
            © 2026 Bull Wave Rides Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-xs tracking-wide">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors duration-200 hover:text-primary active:text-primary/80"
              >
                <span>{link.label}</span>
                <ArrowRight
                  aria-hidden
                  className="bw-link-arrow h-3 w-3 opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                  strokeWidth={2.2}
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
