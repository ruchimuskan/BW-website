"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader } from "@/components/layout";
import { UserProfileNameCard } from "@/components/layout/UserProfileNameCard";
import { profileMenuItems } from "@/constants/profile-menu";
import { ROUTES } from "@/constants/routes";
import { logoutAccount } from "@/lib/profile-api";
import { getStudentPass, getUserSubscription } from "@/lib/membership-api";
import {
  applyMembershipPlanToState,
  MEMBERSHIP_UPDATED_EVENT,
  readCachedMembershipPlan,
} from "@/lib/membership-sync";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ChevronRight, Crown, LogOut } from "lucide-react";
import { brandTheme } from "@/lib/brand-theme";
import { cn } from "@/lib/utils";

export function ProfileView() {
  const router = useRouter();
  const user = useAuthUser();
  const [activePlanName, setActivePlanName] = useState("Free");
  const [activePlanBenefit, setActivePlanBenefit] = useState("Priority rides, ride discounts & more");
  const [isFreePlan, setIsFreePlan] = useState(true);
  const [studentPassStatus, setStudentPassStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadMembership = async () => {
      try {
        const cached = readCachedMembershipPlan();
        if (cached) {
          applyMembershipPlanToState(cached, {
            setActivePlanName,
            setActivePlanBenefit,
            setIsFreePlan,
          });
        }

        const [passRes, subRes] = await Promise.all([getStudentPass(), getUserSubscription()]);
        setStudentPassStatus(passRes.application?.status ?? null);
        const plan = subRes.subscription?.plan as {
          name?: string;
          slug?: string;
          benefits?: string[];
        };
        if (plan?.name) {
          applyMembershipPlanToState(
            {
              name: plan.name,
              slug: plan.slug ?? "free",
              benefits: Array.isArray(plan.benefits) ? plan.benefits : [],
            },
            {
              setActivePlanName,
              setActivePlanBenefit,
              setIsFreePlan,
            }
          );
        }
      } catch {
        // Keep defaults when API is unavailable
      }
    };

    void loadMembership();

    const onMembershipUpdated = () => {
      void loadMembership();
    };
    window.addEventListener(MEMBERSHIP_UPDATED_EVENT, onMembershipUpdated);
    window.addEventListener("focus", onMembershipUpdated);
    return () => {
      window.removeEventListener(MEMBERSHIP_UPDATED_EVENT, onMembershipUpdated);
      window.removeEventListener("focus", onMembershipUpdated);
    };
  }, []);

  return (
    <AppShell>
      <PageHeader title="Profile" subtitle="Account, membership & preferences" />

      <div className="relative flex-1 overflow-x-clip bg-muted">
        <div className={cn(brandTheme.contentShell, "relative max-w-3xl py-5 sm:py-8 lg:max-w-4xl")}>
        <UserProfileNameCard
          user={user}
          variant="profile"
          href={ROUTES.profileAccountSettings}
          className="mb-6"
        />

        <button
          type="button"
          onClick={() => router.push(ROUTES.profileSubscription)}
          className="mb-6 flex w-full items-center gap-4 rounded-2xl bg-gradient-to-br from-[#38471B] via-[#B8D926] to-[#C8E84A] p-5 text-left text-white shadow-[0_20px_44px_-22px_rgba(40,54,20,0.55)] transition hover:brightness-105"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
            <Crown className="h-7 w-7" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="font-heading text-lg font-semibold">
              {isFreePlan ? "Upgrade to BW Rides Plus" : `${activePlanName} Member`}
            </h3>
            <p className="text-sm font-light text-white/85">
              {isFreePlan ? "Priority rides, ride discounts & more" : activePlanBenefit}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-white/90" />
        </button>

        <div className="flex flex-col gap-2.5 sm:gap-3">
          {profileMenuItems.map((item) => {
            const Icon = item.icon;
            const statusBadge =
              item.id === "student-pass" && studentPassStatus
                ? studentPassStatus.charAt(0).toUpperCase() + studentPassStatus.slice(1)
                : null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(item.route)}
                className={cn("group", brandTheme.menuRow)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f9e4] text-[#B8D926] transition-colors group-hover:bg-gradient-to-br group-hover:from-[#B8D926] group-hover:to-[#C8E84A] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#38471B]">{item.label}</span>
                    {statusBadge ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          studentPassStatus === "approved" && "bg-emerald-500/10 text-emerald-700",
                          studentPassStatus === "pending" && "bg-amber-500/15 text-amber-700",
                          studentPassStatus === "rejected" && "bg-destructive/10 text-destructive"
                        )}
                      >
                        {statusBadge}
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#C8E84A]/50 transition-transform group-hover:translate-x-1 group-hover:text-[#B8D926]" />
              </button>
            );
          })}

          <button
            type="button"
            onClick={async () => {
              try {
                await logoutAccount();
              } catch {
                // Local session is cleared inside logout even if API fails
              }
              router.push(ROUTES.landing);
            }}
            className="group mt-3 flex items-center justify-between rounded-2xl border border-destructive/20 bg-destructive/5 p-4 transition-all hover:border-destructive/30 hover:bg-destructive/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-destructive shadow-sm">
                <LogOut className="h-5 w-5" />
              </div>
              <span className="font-semibold text-destructive">Log Out</span>
            </div>
          </button>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
