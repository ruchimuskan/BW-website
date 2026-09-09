"use client";

import type { LucideIcon } from "lucide-react";
import { PublicLegalShell } from "@/components/legal/PublicLegalShell";
import { cn } from "@/lib/utils";

interface LegalSection {
  title: string;
  content: string;
}

interface LegalDocumentViewProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  icon?: LucideIcon;
  sections?: LegalSection[];
  children?: React.ReactNode;
  relatedLinks?: { label: string; href: string }[];
}

export function LegalDocumentView({
  title,
  subtitle,
  lastUpdated = "June 2026",
  icon: Icon,
  sections,
  children,
  relatedLinks,
}: LegalDocumentViewProps) {
  return (
    <PublicLegalShell
      title={title}
      description={subtitle}
      relatedLinks={relatedLinks}
    >
      {(subtitle || Icon) && (
        <div className="mb-5 flex gap-3 rounded-xl border border-[#E4E7E0] bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          {Icon ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#C6E31A]/20 text-[#1B3A22]">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div className="min-w-0">
            {subtitle ? (
              <p className="text-sm leading-relaxed text-[#5A6158]">{subtitle}</p>
            ) : null}
            <p className="mt-2 text-xs font-medium text-[#5A6158]/80">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      )}

      {sections && sections.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {sections.map((section, index) => (
            <article
              key={section.title}
              className={cn(
                "rounded-xl border border-[#E4E7E0] bg-white p-4 shadow-sm sm:p-5",
                index === 0 && "border-[#C6E31A]/40",
              )}
            >
              <h2 className="font-heading text-base font-bold text-[#1B3A22]">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5A6158]">
                {section.content}
              </p>
            </article>
          ))}
        </div>
      ) : (
        children
      )}
    </PublicLegalShell>
  );
}
