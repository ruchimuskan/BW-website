"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Shield,
  Trash2,
  UserX,
  Wallet,
  History,
} from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { WaveGoLogo } from "@/components/layout/WaveGoLogo";
import { PRODUCTION_SITE_URL } from "@/constants/site";
import { ROUTES } from "@/constants/routes";
import { safetyFooterLinks, safetySocialLinks } from "@/constants/safety-content";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "support@bullwaverides.com";
const MAILTO_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Delete My Account")}`;

const deletedItems = [
  { icon: UserX, label: "Personal Profile" },
  { icon: History, label: "Ride History" },
  { icon: MapPin, label: "Saved Addresses" },
  { icon: Wallet, label: "Wallet Data" },
  { icon: Shield, label: "Payment Information" },
] as const;

const retainedItems = [
  "Transaction Records",
  "Tax Records",
  "Fraud Prevention Logs",
] as const;

const requestDetails = [
  "Full Name",
  "Registered Mobile Number",
  "Registered Email Address",
] as const;

function SocialIcon({ icon }: { icon: (typeof safetySocialLinks)[number]["icon"] }) {
  const className = "h-5 w-5";

  if (icon === "facebook") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (icon === "twitter") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (icon === "linkedin") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function InfoCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "rounded-[20px] border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md sm:p-6",
        className
      )}
    >
      {children}
    </article>
  );
}

export function DeleteAccountView() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-6 py-14 text-white sm:py-16 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-secondary/25 blur-3xl" />

        <AnimateIn className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/15 backdrop-blur-sm">
            <Trash2 className="h-8 w-8" aria-hidden />
          </div>
          <h1 className="font-heading text-3xl font-bold leading-tight sm:text-4xl md:text-[2.75rem]">
            Delete Your BW Rides Account
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            We respect your privacy. If you cannot access the app, you can request permanent account
            deletion by email and our support team will assist you.
          </p>
        </AnimateIn>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:py-12 md:py-14">
        {/* Request instructions */}
        <AnimateIn delay={0.05}>
          <InfoCard className="border-primary/15">
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                <Mail className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                  Request account deletion by email
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  If you would like to permanently delete your BW Rides account but cannot access
                  the app, you can request account deletion by email.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[16px] border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <a
                  href={MAILTO_URL}
                  className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <div className="rounded-[16px] border border-border bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Subject
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">Delete My Account</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold text-foreground">Please include the following details:</p>
              <ul className="mt-3 space-y-2">
                {requestDetails.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 rounded-[14px] bg-primary/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              Our support team will verify your request and permanently delete your account within{" "}
              <span className="font-semibold text-foreground">7 working days</span>.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={MAILTO_URL}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] hover:bg-primary/90 active:scale-[0.98]"
              >
                <Mail className="h-4 w-4" aria-hidden />
                Email support
              </a>
              <Link
                href={ROUTES.privacy}
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                Privacy policy
              </Link>
            </div>
          </InfoCard>
        </AnimateIn>

        {/* Data sections */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <AnimateIn delay={0.1}>
            <InfoCard>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#5FA87A]/15 text-[#5FA87A]">
                  <CheckCircle2 className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
                  Data that will be deleted
                </h2>
              </div>
              <Stagger className="space-y-3">
                {deletedItems.map(({ icon: Icon, label }) => (
                  <StaggerItem key={label}>
                    <div className="flex items-center gap-3 rounded-[14px] border border-border/80 bg-muted/20 px-4 py-3 transition-colors hover:border-primary/15">
                      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <CheckCircle2
                        className="ml-auto h-4 w-4 shrink-0 text-[#5FA87A]"
                        aria-hidden
                      />
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </InfoCard>
          </AnimateIn>

          <AnimateIn delay={0.15}>
            <InfoCard>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E8A95A]/15 text-[#E8A95A]">
                  <AlertCircle className="h-5 w-5" aria-hidden />
                </div>
                <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
                  Data that may be retained
                </h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                For legal or regulatory purposes, the following may be retained:
              </p>
              <ul className="space-y-3">
                {retainedItems.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-[14px] border border-border/80 bg-muted/20 px-4 py-3"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8A95A]" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                These records are retained only for the legally required period.
              </p>
            </InfoCard>
          </AnimateIn>
        </div>

        {/* Need help */}
        <AnimateIn delay={0.2} className="mt-6">
          <InfoCard className="bg-gradient-to-br from-card to-muted/30">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Need Help?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reach out to our support team anytime.
                </p>
              </div>
              <div className="space-y-3 sm:text-right">
                <a
                  href={MAILTO_URL}
                  className="flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 sm:justify-end"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {SUPPORT_EMAIL}
                </a>
                <a
                  href={PRODUCTION_SITE_URL}
                  className="flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary sm:justify-end"
                >
                  <Globe className="h-4 w-4" aria-hidden />
                  {PRODUCTION_SITE_URL.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </div>
          </InfoCard>
        </AnimateIn>
      </main>

      {/* Footer */}
      <footer className="bg-foreground px-6 py-14 text-background">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <WaveGoLogo size="md" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
                Premium rides, smart deliveries, and emergency ambulance — one trusted mobility
                platform for modern India.
              </p>
            </div>

            <div>
              <p className="mb-4 text-sm font-bold text-white">Company</p>
              <nav className="flex flex-col gap-3 text-sm text-white/70">
                {safetyFooterLinks.company.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="transition-colors hover:text-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="mb-4 text-sm font-bold text-white">Legal</p>
              <nav className="flex flex-col gap-3 text-sm text-white/70">
                {safetyFooterLinks.legal.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="transition-colors hover:text-secondary"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={ROUTES.deleteAccount}
                  className="font-semibold text-secondary transition-colors hover:text-white"
                >
                  Delete account
                </Link>
              </nav>
            </div>

            <div>
              <p className="mb-4 text-sm font-bold text-white">Follow Us</p>
              <div className="flex gap-4">
                {safetySocialLinks.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="text-white/70 transition-colors hover:text-secondary"
                  >
                    <SocialIcon icon={icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/50">
            © 2026 Bull Wave Rides Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
