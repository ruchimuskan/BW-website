"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MapPinned,
  Phone,
  ShieldAlert,
  Siren,
  UserRound,
} from "lucide-react";
import { SettingsPageLayout } from "@/components/layout/SettingsPageLayout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { BRAND_CTA_LIME } from "@/lib/brand-cta";
import { getProfile, updateProfile } from "@/lib/profile-api";
import { cn } from "@/lib/utils";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizePhone(value: string): string {
  const trimmed = value.trim();
  const digits = digitsOnly(trimmed);
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (trimmed.startsWith("+")) return `+${digits}`;
  return trimmed.replace(/[^\d+]/g, "");
}

function formatPhoneDisplay(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length > 10) {
    return `+${digits}`;
  }
  return value.trim();
}

function isValidEmergencyPhone(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length === 10) return true;
  if (digits.length === 12 && digits.startsWith("91")) return true;
  return digits.length >= 10 && digits.length <= 15;
}

const BENEFITS = [
  {
    icon: Siren,
    title: "SOS alerts",
    body: "Notified when you send SOS from an active trip.",
  },
  {
    icon: MapPinned,
    title: "Live location",
    body: "Gets trip context so they can find you faster.",
  },
  {
    icon: Phone,
    title: "Quick reach",
    body: "Support can call them if you ask for help.",
  },
] as const;

export function EmergencyContactView() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedPhone, setSavedPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getProfile()
      .then((profile) => {
        const nextName = profile.emergency_contact_name?.trim() ?? "";
        const nextPhone = profile.emergency_contact_phone?.trim() ?? "";
        setName(nextName);
        setPhone(nextPhone);
        setSavedName(nextName);
        setSavedPhone(nextPhone);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load your profile."),
      )
      .finally(() => setLoading(false));
  }, []);

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const isConfigured = Boolean(savedName && savedPhone);
  const isDirty =
    trimmedName !== savedName ||
    normalizePhone(trimmedPhone) !== normalizePhone(savedPhone);

  const phoneHint = useMemo(() => {
    if (!trimmedPhone) return null;
    if (!isValidEmergencyPhone(trimmedPhone)) {
      return "Enter a valid mobile number (10 digits, or with +91).";
    }
    return null;
  }, [trimmedPhone]);

  const canSave =
    Boolean(trimmedName) &&
    Boolean(trimmedPhone) &&
    !phoneHint &&
    isDirty &&
    !saving;

  const handleSave = async () => {
    if (!trimmedName) {
      setError("Enter a contact name.");
      return;
    }
    if (!trimmedPhone || phoneHint) {
      setError(phoneHint || "Enter a contact phone number.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    setConfirmClear(false);
    try {
      const updated = await updateProfile({
        emergency_contact_name: trimmedName,
        emergency_contact_phone: normalizePhone(trimmedPhone),
      });
      const nextName = updated.emergency_contact_name?.trim() || trimmedName;
      const nextPhone =
        updated.emergency_contact_phone?.trim() || normalizePhone(trimmedPhone);
      setName(nextName);
      setPhone(nextPhone);
      setSavedName(nextName);
      setSavedPhone(nextPhone);
      setMessage("Saved. SOS can notify this person during your rides.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    if (!isConfigured && !trimmedName && !trimmedPhone) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateProfile({
        emergency_contact_name: "",
        emergency_contact_phone: "",
      });
      setName("");
      setPhone("");
      setSavedName("");
      setSavedPhone("");
      setConfirmClear(false);
      setMessage("Emergency contact removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove contact");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPageLayout
      title="Emergency contact"
      subtitle="Trusted person we can notify if you send SOS on a ride."
      backHref={ROUTES.profileAccountSettings}
      wide
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-sm text-[#5a6330]">
          <Loader2 className="h-7 w-7 animate-spin text-[#9BB820]" />
          Loading your contact…
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">
          <section className="relative overflow-hidden rounded-3xl border border-[#38471B]/10 bg-[#283614] text-white shadow-[0_28px_56px_-32px_rgba(40,54,20,0.55)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(200,232,74,0.22),transparent_55%)]"
            />
            <div className="relative grid gap-6 p-5 sm:grid-cols-[1.15fr_0.85fr] sm:gap-8 sm:p-7">
              <div>
                <div className="flex items-start gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                    <ShieldAlert className="h-6 w-6 text-[#C8E84A]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C8E84A]/90 uppercase">
                      Safety
                    </p>
                    <h2 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-[1.65rem]">
                      Someone who can help fast
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                      {isConfigured
                        ? `We’ll alert ${savedName} at ${formatPhoneDisplay(savedPhone)} if you send SOS.`
                        : "Add a family member or close friend. SOS can share your live trip with them."}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {isConfigured ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C8E84A]/35 bg-[#C8E84A]/15 px-3 py-1.5 text-xs font-semibold text-[#E8F5A0]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Ready for SOS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-100">
                      Not set yet
                    </span>
                  )}
                  <Link
                    href={ROUTES.sos}
                    className="inline-flex h-9 items-center rounded-full border border-white/15 bg-white/10 px-3.5 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    Open SOS
                  </Link>
                </div>
              </div>

              <div className="grid gap-2.5 sm:content-center">
                {BENEFITS.map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#C8E84A]/15 text-[#C8E84A]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/65">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e8f0c8] bg-white p-5 shadow-[0_18px_44px_-28px_rgba(40,54,20,0.4)] sm:p-7">
            <div className="mb-5 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-[#283614]">
                  Contact details
                </h3>
                <p className="mt-1 text-sm text-[#5a6330]">
                  Saved securely on your BW Rides account.
                </p>
              </div>
              {isConfigured ? (
                <p className="text-xs font-medium text-[#5a6330] sm:text-right">
                  Current: {savedName}
                  <span className="mt-0.5 block font-semibold text-[#283614]">
                    {formatPhoneDisplay(savedPhone)}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-1">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#283614]">
                  <UserRound className="h-4 w-4 text-[#6b7a2a]" />
                  Full name
                </span>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setMessage(null);
                    setError(null);
                  }}
                  autoComplete="name"
                  className="h-12 w-full rounded-xl border border-[#dce8a8] bg-[#f7fbe8] px-4 text-sm text-[#283614] outline-none transition focus:border-[#B8D926] focus:bg-white focus:ring-2 focus:ring-[#B8D926]/25"
                  placeholder="e.g. Priya Sharma"
                />
              </label>

              <label className="block sm:col-span-1">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[#283614]">
                  <Phone className="h-4 w-4 text-[#6b7a2a]" />
                  Mobile number
                </span>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setMessage(null);
                    setError(null);
                  }}
                  inputMode="tel"
                  autoComplete="tel"
                  className="h-12 w-full rounded-xl border border-[#dce8a8] bg-[#f7fbe8] px-4 text-sm text-[#283614] outline-none transition focus:border-[#B8D926] focus:bg-white focus:ring-2 focus:ring-[#B8D926]/25"
                  placeholder="+91 98XXX XXXXX"
                />
                <p
                  className={cn(
                    "mt-1.5 text-xs",
                    phoneHint ? "text-amber-700" : "text-[#5a6330]",
                  )}
                >
                  {phoneHint || "10-digit Indian numbers are saved as +91 automatically."}
                </p>
              </label>
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-destructive/20 bg-[#fff6f4] px-3.5 py-2.5 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
                {message}
              </p>
            ) : null}

            {confirmClear ? (
              <div className="mt-5 rounded-xl border border-destructive/20 bg-[#fff6f4] p-4">
                <p className="text-sm font-semibold text-[#283614]">
                  Remove this contact?
                </p>
                <p className="mt-1 text-sm text-[#5a6330]">
                  SOS will not notify them until you add someone again.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleClear()}
                    className="h-10 rounded-xl bg-destructive font-semibold text-white hover:bg-destructive/90 sm:w-auto"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, remove"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => setConfirmClear(false)}
                    className="h-10 rounded-xl border-[#d9dece] sm:w-auto"
                  >
                    Keep contact
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button
                className={cn(
                  "h-12 w-full rounded-xl text-[15px] font-semibold sm:min-w-[180px] sm:flex-1",
                  BRAND_CTA_LIME,
                )}
                disabled={!canSave}
                onClick={() => void handleSave()}
              >
                {saving && !confirmClear ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isConfigured ? (
                  "Update contact"
                ) : (
                  "Save contact"
                )}
              </Button>

              {isConfigured || trimmedName || trimmedPhone ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => {
                    setConfirmClear(true);
                    setMessage(null);
                    setError(null);
                  }}
                  className="h-12 w-full rounded-xl border-destructive/25 font-semibold text-destructive hover:bg-[#fff6f4] sm:w-auto"
                >
                  Remove
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl border-[#dce8a8] font-semibold text-[#283614] hover:bg-[#f7fbe8] sm:w-auto"
                onClick={() => router.push(ROUTES.profileAccountSettings)}
              >
                Back to Personal info
              </Button>
            </div>
          </section>

          <p className="px-1 text-center text-xs leading-relaxed text-[#5a6330] sm:text-left">
            This number is used only for ride safety alerts. You can change or remove it anytime.
          </p>
        </div>
      )}
    </SettingsPageLayout>
  );
}
