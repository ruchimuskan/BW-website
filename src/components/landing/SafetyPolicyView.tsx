"use client";

import { useEffect, useState } from "react";
import { Car, Shield, UserRound } from "lucide-react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { CaptainSafetyView } from "@/components/landing/CaptainSafetyView";
import { CustomerSafetyView } from "@/components/landing/CustomerSafetyView";
import { SafetyOverviewView } from "@/components/landing/SafetyOverviewView";
import {
  safetyTabs,
  type SafetyAudience,
} from "@/constants/safety-content";
import { cn } from "@/lib/utils";

function parseSafetyTab(raw: string | null): SafetyAudience {
  if (raw === "customer" || raw === "captain" || raw === "all") return raw;
  return "all";
}

const tabIcons: Record<SafetyAudience, typeof Shield> = {
  all: Shield,
  customer: UserRound,
  captain: Car,
};

export function SafetyPolicyView() {
  const [activeTab, setActiveTab] = useState<SafetyAudience>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fromHash = parseSafetyTab(
      window.location.hash.replace(/^#/, "").toLowerCase() || null,
    );
    const fromQuery = parseSafetyTab(
      new URLSearchParams(window.location.search).get("tab"),
    );
    setActiveTab(fromHash !== "all" ? fromHash : fromQuery);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    const url = new URL(window.location.href);
    if (activeTab === "all") {
      url.searchParams.delete("tab");
      url.hash = "";
    } else {
      url.searchParams.set("tab", activeTab);
      url.hash = activeTab;
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [activeTab, mounted]);

  const selectTab = (tab: SafetyAudience) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffffff] via-white to-white font-sans">
      <LandingHeader />

      <div className="sticky top-[4rem] z-20 border-b border-primary/8 bg-white/85 backdrop-blur-xl lg:top-[5.25rem]">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
          <div
            className="flex gap-1 overflow-x-auto rounded-2xl border border-primary/10 bg-white/90 p-1 shadow-[0_16px_40px_-28px_rgba(184,217,38,0.35)] [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1.5 [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Safety audience"
          >
            {safetyTabs.map((tab) => {
              const selected = activeTab === tab.id;
              const Icon = tabIcons[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => selectTab(tab.id)}
                  className={cn(
                    "relative flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold tracking-wide transition-all duration-300 sm:px-5 sm:py-3.5",
                    selected
                      ? "bg-gradient-to-r from-primary to-[#9BB820] text-white shadow-[0_10px_28px_-14px_rgba(184,217,38,0.65)]"
                      : "text-[#4a5228]/80 hover:bg-primary/[0.05] hover:text-primary",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div role="tabpanel">
        {activeTab === "customer" ? (
          <CustomerSafetyView />
        ) : activeTab === "captain" ? (
          <CaptainSafetyView />
        ) : (
          <SafetyOverviewView onTabChange={(tab) => selectTab(tab)} />
        )}
      </div>

      <LandingFooter />
    </div>
  );
}
