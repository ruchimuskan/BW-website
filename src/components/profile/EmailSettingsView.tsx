"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { SettingsPageLayout } from "@/components/layout/SettingsPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { getAuthSession, setAuthSession } from "@/lib/auth-session";
import { updateProfile } from "@/lib/profile-api";
import { getEmailValidationError } from "@/lib/auth-validation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: Mail,
    title: "Receipts & updates",
    text: "Trip summaries in your inbox",
  },
  {
    icon: KeyRound,
    title: "Account recovery",
    text: "Regain access if you lose your phone",
  },
  {
    icon: Sparkles,
    title: "Offers & news",
    text: "Optional product updates from us",
  },
] as const;

export function EmailSettingsView() {
  const router = useRouter();
  const authUser = useAuthUser();
  const [email, setEmail] = useState(
    authUser.email === "Add email" ? "" : authUser.email,
  );
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const validationError = useMemo(
    () => (email.trim() ? getEmailValidationError(email, { required: true }) : null),
    [email],
  );
  const valid = Boolean(email.trim()) && !validationError;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const message = getEmailValidationError(email, { required: true });
    if (message) {
      setError(message);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const trimmed = email.trim().toLowerCase();
      await updateProfile({ email: trimmed });
      const session = getAuthSession();
      if (session) {
        setAuthSession({ ...session, email: trimmed });
      }
      router.push(ROUTES.profileAccountSettings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update email.",
      );
    } finally {
      setSaving(false);
    }
  };

  const showError = Boolean(error || (touched && validationError));
  const displayError = error || validationError;

  return (
    <SettingsPageLayout
      title="Email"
      backHref={ROUTES.profileAccountSettings}
      wide
    >
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8">
        <aside className="relative overflow-hidden rounded-2xl border border-[#eef5d4] bg-gradient-to-br from-[#38471B] via-[#B8D926] to-[#C8E84A] p-5 text-white shadow-[0_22px_48px_-28px_rgba(40,54,20,0.55)] sm:rounded-3xl sm:p-6 lg:sticky lg:top-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
            <Mail className="h-5 w-5" strokeWidth={2} />
          </div>
          <h2 className="relative mt-4 font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Add a trusted email
          </h2>
          <p className="relative mt-2 text-sm leading-relaxed text-white/85">
            Use this email for messages, sign-in support, and recovering your
            Bull Wave Rides account.
          </p>

          <ul className="relative mt-5 space-y-3">
            {benefits.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {item.title}
                    </span>
                    <span className="block text-xs text-white/75">
                      {item.text}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>

        <form
          onSubmit={(e) => void handleUpdate(e)}
          noValidate
          className="rounded-2xl border border-[#eef5d4] bg-white p-5 shadow-[0_18px_44px_-28px_rgba(40,54,20,0.4)] sm:rounded-3xl sm:p-7"
        >
          <div className="mb-6 border-b border-[#eef5d4] pb-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#B8D926] uppercase">
              Update email
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#5a6330]">
              Use a real inbox you can access — temporary emails are not
              allowed.
            </p>
          </div>

          <Label htmlFor="email" className="text-sm font-semibold text-[#38471B]">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            onBlur={() => setTouched(true)}
            className={cn(
              "mt-2.5 h-14 w-full rounded-2xl border bg-[#fcfef8] px-4 text-base text-[#38471B] shadow-none placeholder:text-[#a889b8] focus-visible:bg-white focus-visible:ring-2",
              showError
                ? "border-destructive focus-visible:ring-destructive/25"
                : "border-[#eef5d4] focus-visible:border-[#C8E84A]/50 focus-visible:ring-primary/20",
            )}
            placeholder="you@gmail.com"
            aria-invalid={showError}
            autoComplete="email"
          />

          <div className="mt-3 flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B8D926]" />
            <p className="text-xs leading-relaxed text-[#5a6330]">
              Use your existing email
            </p>
          </div>

          {showError && displayError ? (
            <p className="mt-3 text-sm font-medium text-destructive" role="alert">
              {displayError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!valid || saving}
            className="mt-8 h-12 w-full rounded-xl text-sm font-semibold tracking-wide shadow-[0_14px_32px_-14px_rgba(184,217,38,0.55)] transition hover:brightness-105 disabled:shadow-none sm:h-14 sm:text-base"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save email"
            )}
          </Button>

          <button
            type="button"
            onClick={() => router.push(ROUTES.profileAccountSettings)}
            className="mt-3 w-full py-2.5 text-center text-sm font-medium text-[#38471B] transition-colors hover:text-[#4A5824]"
          >
            Cancel
          </button>
        </form>
      </div>
    </SettingsPageLayout>
  );
}
