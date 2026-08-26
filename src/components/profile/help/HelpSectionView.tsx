"use client";

import { notFound } from "next/navigation";
import { getHelpSection } from "@/data/help-center";
import { helpArticlePath } from "@/lib/help-routes";
import { ROUTES } from "@/constants/routes";
import {
  HelpArticleRow,
  HelpTopicShell,
  articleIcon,
} from "@/components/profile/help/HelpTopicShell";

interface HelpSectionViewProps {
  sectionId: string;
}

const SECTION_SUBTITLES: Record<string, string> = {
  "safety-emergency":
    "SOS, trip share, women captains, ambulance, and how to report an incident.",
  map: "Report a wrong pin, address, landmark, or road so we can fix routing.",
  transit: "Last-mile rides to metro, railway stations, and bus terminals.",
  cancellation: "When cancellation is free, when a fee applies, and how to check refunds.",
  passes: "How commute passes apply on eligible trips.",
  membership: "Plans, benefits, and how to change your membership.",
  accessibility: "Screen readers and accessible ride options.",
  grievance: "Escalate an unresolved trip, payment, or safety concern.",
  account: "Sign-in, profile, and payments.",
  guides: "How to book, policies, and services.",
  trip: "Fares, cancellations, lost items, and trip issues.",
};

export function HelpSectionView({ sectionId }: HelpSectionViewProps) {
  const section = getHelpSection(sectionId);

  if (!section) {
    notFound();
  }

  const items =
    section.articles.length === 1 && section.articles[0].children?.length
      ? section.articles[0].children
      : section.articles;

  return (
    <HelpTopicShell
      title={section.title}
      subtitle={SECTION_SUBTITLES[sectionId]}
      backHref={ROUTES.profileHelp}
      breadcrumb={{ sectionTitle: section.title, sectionId }}
    >
      <div className="flex w-full flex-col gap-2.5 sm:gap-3">
        {items.map((article) => (
          <HelpArticleRow
            key={article.id}
            title={article.title}
            icon={articleIcon(article.title)}
            href={helpArticlePath(sectionId, article.id)}
          />
        ))}
      </div>
    </HelpTopicShell>
  );
}
