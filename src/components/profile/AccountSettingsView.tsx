"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Languages,
  Mail,
  Phone,
  Shield,
  ShieldAlert,
  Star,
  UserRound,
} from "lucide-react";
import { SettingsPageLayout } from "@/components/layout/SettingsPageLayout";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ROUTES } from "@/constants/routes";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useAuthUser } from "@/hooks/useAuthUser";
import { APP_LANGUAGES, type AppLanguageCode } from "@/lib/app-language";
import { getProfile, type Profile } from "@/lib/profile-api";
import { cn } from "@/lib/utils";

type RowStatus = "warning" | "verified" | null;

interface InfoRow {
  id: string;
  label: string;
  value: string;
  hint?: string | null;
  status: RowStatus;
  route: string | null;
  action: "language" | null;
  icon: ReactNode;
  accent?: "safety";
}

function StatusBadge({
  status,
  verifiedLabel,
  neededLabel,
}: {
  status: RowStatus;
  verifiedLabel: string;
  neededLabel: string;
}) {
  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase">
        <AlertTriangle className="h-3 w-3" />
        {neededLabel}
      </span>
    );
  }
  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 uppercase">
        <CheckCircle2 className="h-3 w-3" />
        {verifiedLabel}
      </span>
    );
  }
  return null;
}

function SettingsRow({
  row,
  onPress,
  verifiedLabel,
  neededLabel,
}: {
  row: InfoRow;
  onPress: () => void;
  verifiedLabel: string;
  neededLabel: string;
}) {
  const interactive = Boolean(row.route) || row.action === "language";

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onPress}
      className={cn(
        "flex w-full min-w-0 items-center gap-3 px-4 py-4 text-left transition-colors sm:gap-4 sm:px-5 sm:py-[1.125rem]",
        interactive
          ? "hover:bg-[#fcfef8] focus-visible:bg-[#fcfef8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/20"
          : "cursor-default",
        row.accent === "safety" && "bg-gradient-to-r from-[#fff8f5] via-white to-white",
      )}
    >
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
          row.accent === "safety"
            ? "border-[#ffd8cc]/80 bg-[#fff0eb] text-[#c45a00]"
            : "border-[#eef5d4] bg-[#f4f9e4] text-[#B8D926]",
        )}
      >
        {row.icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#38471B] sm:text-[15px]">
          {row.label}
        </p>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
          <p
            className={cn(
              "min-w-0 text-sm leading-snug",
              row.status === "warning"
                ? "font-medium text-[#b45309]"
                : "text-[#5a6330]",
              row.id !== "emergency" && "truncate",
            )}
          >
            {row.value}
          </p>
          <StatusBadge
            status={row.status}
            verifiedLabel={verifiedLabel}
            neededLabel={neededLabel}
          />
        </div>
        {row.hint ? (
          <p className="mt-1 text-xs leading-relaxed text-[#8a6a9a]">{row.hint}</p>
        ) : null}
      </div>
      {interactive ? (
        <ChevronRight
          className="h-5 w-5 shrink-0 text-[#C8E84A]/65"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-[11px] font-bold tracking-[0.18em] text-[#B8D926] uppercase">
        {title}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-[#eef5d4] bg-white shadow-[0_16px_40px_-28px_rgba(40,54,20,0.35)] sm:rounded-3xl">
        {children}
      </div>
    </section>
  );
}

function ProfileHeroSkeleton() {
  return (
    <div className="mb-6 animate-pulse overflow-hidden rounded-3xl border border-[#eef5d4] bg-white p-5 sm:mb-8 sm:p-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div className="h-24 w-24 rounded-full bg-[#eef5d4] sm:h-28 sm:w-28" />
        <div className="w-full space-y-2 sm:flex-1">
          <div className="mx-auto h-6 w-40 rounded-lg bg-[#eef5d4] sm:mx-0" />
          <div className="mx-auto h-4 w-32 rounded-lg bg-[#f4f9e4] sm:mx-0" />
          <div className="mx-auto h-5 w-36 rounded-full bg-[#f4f9e4] sm:mx-0" />
        </div>
      </div>
    </div>
  );
}

export function AccountSettingsView() {
  const router = useRouter();
  const user = useAuthUser();
  const { language, setAppLanguage, t } = useAppLanguage();
  const hasEmail = user.email !== "Add email";
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProfileLoading(true);
    setProfileError(null);
    void getProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setProfile(null);
          setProfileError(
            err instanceof Error ? err.message : "Unable to load profile",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectLanguage = (code: AppLanguageCode) => {
    setAppLanguage(code);
    setLanguageOpen(false);
  };

  const emergencyName = profile?.emergency_contact_name?.trim() ?? "";
  const emergencyPhone = profile?.emergency_contact_phone?.trim() ?? "";
  const hasEmergencyContact = Boolean(emergencyName && emergencyPhone);

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (user.name && user.name !== "BW Rides User") score += 25;
    if (user.phone) score += 25;
    if (hasEmail) score += 25;
    if (hasEmergencyContact) score += 25;
    return score;
  }, [user.name, user.phone, hasEmail, hasEmergencyContact]);

  const emergencyValue = hasEmergencyContact
    ? `${emergencyName} · ${emergencyPhone}`
    : emergencyName || emergencyPhone || t("addEmergencyContact");

  const contactRows: InfoRow[] = [
    {
      id: "name",
      label: t("name"),
      value: user.name,
      status: null,
      route: null,
      action: null,
      icon: <UserRound className="h-5 w-5" strokeWidth={2} />,
    },
    {
      id: "phone",
      label: t("phoneNumber"),
      value: user.phone || t("notSet"),
      status: user.phone ? "verified" : "warning",
      route: ROUTES.profilePhone,
      action: null,
      icon: <Phone className="h-5 w-5" strokeWidth={2} />,
    },
    {
      id: "email",
      label: t("email"),
      value: user.email,
      status: hasEmail ? "verified" : "warning",
      route: ROUTES.profileEmail,
      hint: hasEmail ? null : t("addEmailHint"),
      action: null,
      icon: <Mail className="h-5 w-5" strokeWidth={2} />,
    },
  ];

  const safetyRows: InfoRow[] = [
    {
      id: "emergency",
      label: t("emergencyContact"),
      value: emergencyValue,
      status: hasEmergencyContact ? "verified" : "warning",
      route: ROUTES.profileEmergencyContact,
      hint: hasEmergencyContact ? t("emergencyConfigured") : t("emergencyHint"),
      action: null,
      icon: <ShieldAlert className="h-5 w-5" strokeWidth={2} />,
      accent: "safety",
    },
  ];

  const preferenceRows: InfoRow[] = [
    {
      id: "language",
      label: t("language"),
      value: `${language.label} · ${language.nativeLabel}`,
      status: null,
      route: null,
      hint: t("languageHint"),
      action: "language",
      icon: <Languages className="h-5 w-5" strokeWidth={2} />,
    },
  ];

  const handleRowPress = (row: InfoRow) => {
    if (row.action === "language") {
      setLanguageOpen(true);
      return;
    }
    if (row.route) router.push(row.route);
  };

  const showHeroSkeleton = user.isLoading || profileLoading;

  return (
    <SettingsPageLayout
      title={t("personalInfo")}
      subtitle={t("personalInfoSubtitle")}
    >
      {profileError ? (
        <div className="mb-4 rounded-2xl border border-destructive/20 bg-[#fff8f8] px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Could not load profile from the server.</p>
          <p className="mt-1 text-xs text-[#5a6330]">{profileError}</p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : null}
      {showHeroSkeleton ? (
        <ProfileHeroSkeleton />
      ) : (
        <div className="mb-6 overflow-hidden rounded-3xl border border-[#eef5d4] bg-gradient-to-br from-white via-[#fcfef8] to-[#f4f9e4]/35 shadow-[0_20px_48px_-28px_rgba(40,54,20,0.38)] sm:mb-8">
          <div className="relative px-5 pb-5 pt-6 sm:px-6 sm:pb-6 sm:pt-7">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(184,217,38,0.16),transparent_70%)]"
            />
            <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#B8D926] to-[#C8E84A] opacity-90 blur-[1px]" />
                <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#B8D926] to-[#C8E84A] text-white shadow-[0_18px_40px_-20px_rgba(184,217,38,0.55)] ring-4 ring-white sm:h-28 sm:w-28">
                  {user.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <span className="font-heading text-3xl font-bold sm:text-4xl">
                      {user.initial}
                    </span>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#f4f9e4] text-[#B8D926] shadow-sm">
                  <Shield className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
              </div>

              <div className="mt-4 min-w-0 sm:mt-0 sm:flex-1">
                <p className="font-heading text-xl font-semibold text-[#38471B] sm:text-2xl">
                  {user.name}
                </p>
                <p className="mt-1 text-sm text-[#5a6330]">
                  {user.phone || t("notSet")}
                </p>
                {hasEmail ? (
                  <p className="mt-0.5 truncate text-sm text-[#7a8448]">{user.email}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C8E84A]/12 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#B8D926] uppercase">
                    {t("accountBadge")}
                  </span>
                  {user.rating > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#38471B] shadow-sm">
                      <Star className="h-3 w-3 fill-[#B8D926] text-[#B8D926]" />
                      {user.rating}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="relative mt-5 rounded-2xl border border-[#eef5d4]/90 bg-white/80 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#38471B]">
                  {t("profileComplete")}
                </p>
                <p className="text-sm font-bold text-[#B8D926]">{profileCompletion}%</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eef5d4]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#B8D926] to-[#C8E84A] transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 ? (
                <p className="mt-2 text-xs leading-relaxed text-[#8a6a9a]">
                  {t("profileCompleteHint")}
                </p>
              ) : (
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  {t("profileCompleteDone")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 sm:space-y-7">
        <SettingsSection title={t("contactDetails")}>
          {contactRows.map((row, index) => (
            <div key={row.id}>
              {index > 0 ? (
                <div className="border-t border-[#eef5d4]/90" aria-hidden />
              ) : null}
              <SettingsRow
                row={row}
                onPress={() => handleRowPress(row)}
                verifiedLabel={t("verified")}
                neededLabel={t("needed")}
              />
            </div>
          ))}
        </SettingsSection>

        <SettingsSection title={t("safety")}>
          {safetyRows.map((row) => (
            <SettingsRow
              key={row.id}
              row={row}
              onPress={() => handleRowPress(row)}
              verifiedLabel={t("verified")}
              neededLabel={t("needed")}
            />
          ))}
        </SettingsSection>

        <SettingsSection title={t("preferences")}>
          {preferenceRows.map((row) => (
            <SettingsRow
              key={row.id}
              row={row}
              onPress={() => handleRowPress(row)}
              verifiedLabel={t("verified")}
              neededLabel={t("needed")}
            />
          ))}
        </SettingsSection>
      </div>

      <Sheet open={languageOpen} onOpenChange={setLanguageOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[85dvh] gap-0 rounded-t-3xl border-[#eef5d4] bg-white p-0 sm:max-h-[90dvh] sm:data-[side=bottom]:mx-auto sm:data-[side=bottom]:max-w-lg"
        >
          <SheetHeader className="border-b border-[#eef5d4] px-5 py-4 text-left sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4f9e4] text-[#B8D926]">
                <Globe2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <SheetTitle className="font-heading text-lg text-[#38471B] sm:text-xl">
                  {t("appLanguage")}
                </SheetTitle>
                <SheetDescription className="text-sm text-[#5a6330]">
                  {t("appLanguageDesc")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
            <ul className="space-y-2">
              {APP_LANGUAGES.map((option) => {
                const selected = option.code === language.code;
                return (
                  <li key={option.code}>
                    <button
                      type="button"
                      onClick={() => handleSelectLanguage(option.code)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3.5 text-left transition-all sm:px-4",
                        selected
                          ? "border-[#C8E84A]/45 bg-[#fcfef8] shadow-[0_10px_24px_-18px_rgba(184,217,38,0.45)]"
                          : "border-[#eef5d4] bg-white hover:border-[#C8E84A]/35 hover:bg-[#fcfef8]",
                      )}
                      aria-pressed={selected}
                    >
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold uppercase",
                          selected
                            ? "bg-gradient-to-br from-[#B8D926] to-[#C8E84A] text-white"
                            : "bg-[#f4f9e4] text-[#B8D926]",
                        )}
                      >
                        {option.code}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#38471B]">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-[#5a6330]">
                          {option.nativeLabel} · {option.region}
                        </span>
                      </span>
                      {selected ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                      ) : (
                        <span className="h-8 w-8" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 px-1 pb-2 text-center text-xs leading-relaxed text-[#8a6a9a]">
              {t("languageSavedNote")}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </SettingsPageLayout>
  );
}
