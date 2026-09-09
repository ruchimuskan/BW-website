"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Lock,
  Receipt,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { GlowButton } from "@/components/landing/GlowButton";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { AnimateIn, Stagger, StaggerItem } from "@/components/motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import {
  registerCorporateCompany,
  type CompanyRegisterPayload,
} from "@/lib/corporate-api";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-lg border-[#d8cce3] bg-white text-foreground shadow-none transition-[border-color,box-shadow] duration-200 placeholder:text-[#4a5228]/40 hover:border-primary/35 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/12";

const emptyForm: CompanyRegisterPayload = {
  company_name: "",
  gst_number: "",
  pan_number: "",
  website: "",
  industry: "",
  company_size: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  contact_person: "",
  email: "",
  phone: "",
  password: "",
};

const assurances = [
  { label: "Centralised billing", icon: Receipt },
  { label: "Admin-controlled access", icon: Lock },
  { label: "Verified captain network", icon: ShieldCheck },
  { label: "Live trip visibility", icon: BadgeCheck },
] as const;

const perks = [
  {
    icon: Users,
    title: "Unified employee travel",
    description:
      "One booking workspace for your teams — with clear trip history and oversight for every journey.",
  },
  {
    icon: Receipt,
    title: "Company-level invoicing",
    description:
      "Consolidate rides into structured billing after approval. Fewer reimbursements, cleaner finance close.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade safety",
    description:
      "Verified captains, live tracking, trip share, and SOS support — the same standards riders already trust.",
  },
] as const;

const steps = [
  {
    icon: ClipboardList,
    title: "Submit company profile",
    detail:
      "Provide legal, billing, and primary admin details for a secure review.",
  },
  {
    icon: BadgeCheck,
    title: "Verification & approval",
    detail:
      "Our business desk confirms your organisation and activates company billing.",
  },
  {
    icon: UserPlus,
    title: "Enable your workforce",
    detail:
      "Invite employees to book under one account with admin visibility retained.",
  },
] as const;

const whyRegister = [
  "Single billing account across all employee trips",
  "Admin controls with full trip visibility",
  "GST-ready company profile and invoicing flow",
  "Safety stack aligned with consumer rides",
] as const;

export function CorporateRegisterView() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [form, setForm] = useState<CompanyRegisterPayload>(emptyForm);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    company_name: string;
    company_code: string;
    email: string;
  } | null>(null);

  const setField = (key: keyof CompanyRegisterPayload, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const scrollToForm = () => {
    document.getElementById("business-form")?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.company_name.trim() || !form.contact_person.trim()) {
      setError("Company name and contact person are required.");
      return;
    }
    if (!form.email.trim() || !form.phone.trim()) {
      setError("Email and phone are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CompanyRegisterPayload = {
        ...form,
        company_name: form.company_name.trim(),
        contact_person: form.contact_person.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        gst_number: form.gst_number?.trim() || undefined,
        pan_number: form.pan_number?.trim() || undefined,
        website: form.website?.trim() || undefined,
        industry: form.industry?.trim() || undefined,
        company_size: form.company_size?.trim() || undefined,
        address: form.address?.trim() || undefined,
        city: form.city?.trim() || undefined,
        state: form.state?.trim() || undefined,
        country: form.country?.trim() || "India",
      };
      const res = await registerCorporateCompany(payload);
      setResult({
        company_name: res.company.company_name,
        company_code: res.company.company_code,
        email: res.company.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f7fbe8] font-sans text-[#38471B]">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-primary/10 bg-[#12081c] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(200,232,74,0.28),transparent_55%),radial-gradient(ellipse_55%_50%_at_100%_100%,rgba(184,217,38,0.35),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:48px_48px]"
        />

        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <AnimateIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] text-[#D4E88A] uppercase backdrop-blur-sm">
                <Building2 className="h-3.5 w-3.5" />
                Corporate travel
              </div>

              <h1 className="mt-5 font-heading text-[1.85rem] font-light leading-[1.12] tracking-tight min-[400px]:text-[2.15rem] sm:text-4xl lg:text-[2.75rem]">
                Business mobility,
                <span className="mt-1 block font-semibold text-white sm:mt-1.5">
                  managed with clarity.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-[14px] font-light leading-relaxed text-white/72 sm:mt-5 sm:text-base">
                Register your organisation for employee travel billed to a single
                company account. After approval, your team books with the same
                premium safety standards — under admin control.
              </p>

              {!result ? (
                <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
                  <GlowButton onClick={scrollToForm}>
                    Begin registration
                    <ArrowDown className="h-4 w-4" />
                  </GlowButton>
                  <GlowButton
                    tone="glass"
                    className="!normal-case !tracking-wide"
                    onClick={() => router.push(ROUTES.corporateLogin)}
                  >
                    Company login
                  </GlowButton>
                </div>
              ) : null}

              <ul className="mt-8 flex flex-wrap gap-2.5 sm:mt-10">
                {assurances.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/80"
                    >
                      <Icon className="h-3.5 w-3.5 text-[#C6E31A]" strokeWidth={2.25} />
                      {item.label}
                    </li>
                  );
                })}
              </ul>
            </AnimateIn>

            <AnimateIn delay={0.1} className="hidden lg:block">
              <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] p-6 shadow-[0_32px_64px_-36px_rgba(0,0,0,0.65)] backdrop-blur-md">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-secondary/25 blur-3xl"
                />
                <p className="relative text-[10px] font-semibold tracking-[0.24em] text-[#D4E88A] uppercase">
                  How onboarding works
                </p>
                <p className="relative mt-2 text-sm font-light text-white/60">
                  From application to active employee bookings in three steps.
                </p>
                <ol className="relative mt-6 space-y-5">
                  {steps.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <motion.li
                        key={step.title}
                        className="relative flex gap-4"
                        initial={reduceMotion ? false : { y: 10, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                      >
                        {i < steps.length - 1 ? (
                          <span
                            aria-hidden
                            className="absolute left-[19px] top-10 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-[#C6E31A]/70 to-white/15"
                          />
                        ) : null}
                        <span className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C6E31A]/45 bg-[#1c0f2a] text-[#C6E31A] shadow-[0_0_0_4px_rgba(18,8,28,0.9)]">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <div className="flex items-baseline gap-2">
                            <span className="font-heading text-[11px] tracking-[0.16em] text-[#C6E31A]">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <p className="text-sm font-semibold tracking-tight text-white">
                              {step.title}
                            </p>
                          </div>
                          <p className="mt-1.5 text-[13px] font-light leading-relaxed text-white/65">
                            {step.detail}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="relative border-b border-primary/10 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <AnimateIn className="max-w-2xl">
            <p className="text-[10px] font-semibold tracking-[0.24em] text-secondary uppercase sm:text-[11px]">
              Why organisations choose us
            </p>
            <h2
              className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl bw-title"
            >
              Built for finance, ops, and employee experience
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-[#4a5228] sm:text-[15px]">
              A structured corporate layer on top of BW Rides — so travel
              is easier to approve, bill, and oversee.
            </p>
          </AnimateIn>

          <Stagger className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {perks.map((perk, index) => {
              const Icon = perk.icon;
              return (
                <StaggerItem key={perk.title} index={index}>
                  <motion.article
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -4, transition: { duration: 0.2 } }
                    }
                    className="group flex h-full flex-col rounded-2xl border border-primary/10 bg-[#ffffff] p-5 transition-colors duration-300 hover:border-primary/25 hover:bg-white hover:shadow-[0_22px_48px_-30px_rgba(40,54,20,0.45)] sm:p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-white text-primary transition-colors duration-300 group-hover:border-primary/30 group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </div>
                    <h3
                      className="mt-5 font-heading text-base font-semibold tracking-tight sm:text-[1.05rem] bw-title"
                    >
                      {perk.title}
                    </h3>
                    <p className="mt-2.5 flex-1 text-[13px] font-light leading-relaxed text-[#4a5228] sm:text-sm">
                      {perk.description}
                    </p>
                  </motion.article>
                </StaggerItem>
              );
            })}
          </Stagger>

          {/* Mobile onboarding */}
          <AnimateIn className="mt-8 lg:hidden">
            <div className="rounded-2xl border border-primary/10 bg-[#12081c] p-5 text-white sm:p-6">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-[#D4E88A] uppercase">
                How onboarding works
              </p>
              <ol className="mt-5 space-y-4">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.title} className="flex items-start gap-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#C6E31A]/45 bg-white/5 text-[#C6E31A]">
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-sm font-semibold text-white">
                          <span className="mr-2 font-heading text-[11px] tracking-[0.14em] text-[#C6E31A]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {step.title}
                        </p>
                        <p className="mt-1 text-[12px] font-light leading-relaxed text-white/65">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Form */}
      <main
        id="business-form"
        className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14 lg:py-16"
      >
        <div className="mx-auto max-w-6xl">
          {result ? (
            <AnimateIn className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-primary/12 bg-white shadow-[0_24px_56px_-32px_rgba(184,217,38,0.4)]">
              <div className="border-b border-primary/10 bg-gradient-to-r from-[#ffffff] to-white px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex items-center gap-3 text-primary">
                  <motion.span
                    initial={reduceMotion ? false : { scale: 0.75 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  >
                    <CheckCircle2 className="h-7 w-7" />
                  </motion.span>
                  <h2
                    className="font-heading text-xl font-semibold bw-title"
                  >
                    Application received
                  </h2>
                </div>
                <p className="mt-2 text-sm font-light text-[#4a5228]">
                  Your company registration is pending admin approval. Employee
                  management unlocks after verification.
                </p>
              </div>
              <dl className="space-y-0 px-5 py-2 sm:px-8">
                {[
                  ["Company", result.company_name],
                  ["Company code", result.company_code],
                  ["Login email", result.email],
                  ["Status", "PENDING"],
                ].map(([label, value], i, arr) => (
                  <div
                    key={label}
                    className={cn(
                      "flex justify-between gap-4 py-3.5 text-sm",
                      i < arr.length - 1 && "border-b border-primary/8",
                    )}
                  >
                    <dt className="text-[#4a5228]">{label}</dt>
                    <dd
                      className={cn(
                        "text-right font-medium break-all",
                        label === "Status" ? "text-secondary" : "text-primary",
                      )}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex w-full flex-col gap-3 border-t border-primary/10 px-5 py-5 sm:flex-row sm:px-8 sm:py-6">
                <GlowButton onClick={() => router.push(ROUTES.corporateLogin)}>
                  Company login
                </GlowButton>
                <GlowButton
                  tone="outline"
                  onClick={() => router.push(ROUTES.landing)}
                >
                  Back to home
                </GlowButton>
              </div>
            </AnimateIn>
          ) : (
            <>
              <AnimateIn className="mb-8 max-w-2xl sm:mb-10">
                <p className="text-[10px] font-semibold tracking-[0.24em] text-secondary uppercase sm:text-[11px]">
                  Company registration
                </p>
                <h2
                  className="mt-3 font-heading text-2xl font-semibold tracking-tight sm:text-3xl bw-title"
                >
                  Apply for a corporate account
                </h2>
                <p className="mt-3 text-sm font-light leading-relaxed text-[#4a5228] sm:text-[15px]">
                  Complete both sections below. Required fields are marked with
                  an asterisk. Applications are reviewed before activation.
                </p>
              </AnimateIn>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
                <AnimateIn>
                  <form
                    onSubmit={onSubmit}
                    className="overflow-hidden rounded-2xl border border-primary/12 bg-white shadow-[0_24px_56px_-34px_rgba(40,54,20,0.35)]"
                  >
                    {/* Progress */}
                    <div className="flex border-b border-primary/10 bg-[#ffffff]/80">
                      <div className="flex flex-1 items-center gap-2.5 border-r border-primary/10 px-4 py-3.5 sm:px-6">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                          1
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold tracking-[0.12em] text-primary uppercase">
                            Organisation
                          </p>
                          <p className="hidden text-[12px] font-light text-[#4a5228] sm:block">
                            Legal &amp; business details
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-center gap-2.5 px-4 py-3.5 sm:px-6">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/25 bg-white text-[11px] font-bold text-primary">
                          2
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold tracking-[0.12em] text-[#B8D926] uppercase">
                            Admin access
                          </p>
                          <p className="hidden text-[12px] font-light text-[#4a5228] sm:block">
                            Contact &amp; credentials
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 min-[400px]:p-5 sm:p-8">
                      <section>
                        <div className="mb-5 flex items-start justify-between gap-3">
                          <div>
                            <h3
                              className="font-heading text-lg font-semibold bw-title"
                            >
                              Organisation details
                            </h3>
                            <p className="mt-1 text-sm font-light text-[#4a5228]">
                              Used for verification and invoicing.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field
                            label="Company name *"
                            className="md:col-span-2"
                          >
                            <Input
                              className={inputClass}
                              value={form.company_name}
                              onChange={(e) =>
                                setField("company_name", e.target.value)
                              }
                              placeholder="Registered legal name"
                              required
                            />
                          </Field>
                          <Field label="GST number">
                            <Input
                              className={inputClass}
                              value={form.gst_number}
                              onChange={(e) =>
                                setField("gst_number", e.target.value)
                              }
                              placeholder="15 characters"
                            />
                          </Field>
                          <Field label="PAN number">
                            <Input
                              className={inputClass}
                              value={form.pan_number}
                              onChange={(e) =>
                                setField("pan_number", e.target.value)
                              }
                              placeholder="10 characters"
                            />
                          </Field>
                          <Field label="Website">
                            <Input
                              className={inputClass}
                              value={form.website}
                              onChange={(e) =>
                                setField("website", e.target.value)
                              }
                              placeholder="https://"
                            />
                          </Field>
                          <Field label="Industry">
                            <Input
                              className={inputClass}
                              value={form.industry}
                              onChange={(e) =>
                                setField("industry", e.target.value)
                              }
                              placeholder="e.g. Technology, Logistics"
                            />
                          </Field>
                          <Field label="Company size">
                            <Input
                              className={inputClass}
                              value={form.company_size}
                              onChange={(e) =>
                                setField("company_size", e.target.value)
                              }
                              placeholder="e.g. 50–200"
                            />
                          </Field>
                          <Field label="Country">
                            <Input
                              className={inputClass}
                              value={form.country}
                              onChange={(e) =>
                                setField("country", e.target.value)
                              }
                            />
                          </Field>
                          <Field label="Registered address" className="md:col-span-2">
                            <Input
                              className={inputClass}
                              value={form.address}
                              onChange={(e) =>
                                setField("address", e.target.value)
                              }
                              placeholder="Street, building, locality"
                            />
                          </Field>
                          <Field label="City">
                            <Input
                              className={inputClass}
                              value={form.city}
                              onChange={(e) => setField("city", e.target.value)}
                            />
                          </Field>
                          <Field label="State">
                            <Input
                              className={inputClass}
                              value={form.state}
                              onChange={(e) =>
                                setField("state", e.target.value)
                              }
                            />
                          </Field>
                        </div>
                      </section>

                      <section className="mt-9 border-t border-primary/10 pt-8">
                        <div className="mb-5">
                          <h3
                            className="font-heading text-lg font-semibold bw-title"
                          >
                            Primary admin &amp; login
                          </h3>
                          <p className="mt-1 text-sm font-light text-[#4a5228]">
                            This contact becomes the company portal administrator.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field
                            label="Contact person *"
                            className="md:col-span-2"
                          >
                            <Input
                              className={inputClass}
                              value={form.contact_person}
                              onChange={(e) =>
                                setField("contact_person", e.target.value)
                              }
                              placeholder="Full name"
                              required
                            />
                          </Field>
                          <Field label="Work email *">
                            <Input
                              type="email"
                              className={inputClass}
                              value={form.email}
                              onChange={(e) =>
                                setField("email", e.target.value)
                              }
                              placeholder="name@company.com"
                              required
                            />
                          </Field>
                          <Field label="Phone *">
                            <Input
                              className={inputClass}
                              value={form.phone}
                              onChange={(e) =>
                                setField("phone", e.target.value)
                              }
                              placeholder="+91"
                              required
                            />
                          </Field>
                          <Field label="Password *">
                            <Input
                              type="password"
                              className={inputClass}
                              value={form.password}
                              onChange={(e) =>
                                setField("password", e.target.value)
                              }
                              placeholder="Minimum 8 characters"
                              required
                              minLength={8}
                            />
                          </Field>
                          <Field label="Confirm password *">
                            <Input
                              type="password"
                              className={inputClass}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder="Re-enter password"
                              required
                              minLength={8}
                            />
                          </Field>
                        </div>
                      </section>

                      {error ? (
                        <motion.p
                          role="alert"
                          initial={reduceMotion ? false : { y: 6 }}
                          animate={{ y: 0 }}
                          className="mt-6 rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
                        >
                          {error}
                        </motion.p>
                      ) : null}

                      <div className="mt-8 flex w-full flex-col gap-4 border-t border-primary/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <GlowButton type="submit" disabled={submitting}>
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting…
                            </>
                          ) : (
                            <>
                              Submit for approval
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </GlowButton>
                        <p className="text-center text-sm text-[#4a5228] sm:text-right">
                          Already registered?{" "}
                          <Link
                            href={ROUTES.corporateLogin}
                            className="font-semibold text-primary transition-colors hover:text-secondary"
                          >
                            Company login
                          </Link>
                        </p>
                      </div>
                    </div>
                  </form>
                </AnimateIn>

                <AnimateIn delay={0.08} className="lg:block">
                  <aside className="space-y-4 lg:sticky lg:top-28">
                    <div className="rounded-2xl border border-primary/12 bg-white p-5 shadow-[0_16px_40px_-28px_rgba(40,54,20,0.3)] sm:p-6">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-secondary uppercase">
                        What you get
                      </p>
                      <ul className="mt-4 space-y-3.5">
                        {whyRegister.map((item) => (
                          <li
                            key={item}
                            className="flex gap-2.5 text-sm leading-snug text-[#4a5228]"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-primary/10 bg-[#12081c] p-5 text-white sm:p-6">
                      <p className="text-[10px] font-semibold tracking-[0.22em] text-[#D4E88A] uppercase">
                        After approval
                      </p>
                      <p className="mt-3 text-sm font-light leading-relaxed text-white/75">
                        Sign in to the company portal to invite employees,
                        monitor trips, and manage billing visibility from one
                        place.
                      </p>
                      <Link
                        href={ROUTES.corporateLogin}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary transition-colors hover:text-[#D4E88A]"
                      >
                        Open company login
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <p className="hidden px-1 text-[12px] font-light leading-relaxed text-[#4a5228]/90 lg:block">
                      Applications are reviewed before activation. Incomplete or
                      unverifiable profiles may be delayed.
                    </p>
                  </aside>
                </AnimateIn>
              </div>
            </>
          )}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-[13px] font-medium text-[#4a5228]">{label}</Label>
      {children}
    </div>
  );
}
