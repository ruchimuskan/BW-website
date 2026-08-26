import { redirect } from "next/navigation";
import { HelpArticleView } from "@/components/profile/help";
import { getHelpArticle, getHelpSection } from "@/data/help-center";
import { helpSectionPath } from "@/lib/help-routes";

interface HelpArticlePageProps {
  params: Promise<{ section: string; article: string }>;
}

const LEGACY_SECTION_HUBS: Record<string, string[]> = {
  transit: ["transit-options"],
  map: ["map-issues"],
  cancellation: ["cancellation-help"],
  passes: ["ride-passes"],
  grievance: ["grievance-help"],
  membership: ["membership-overview"],
  accessibility: ["accessibility-resources"],
  "safety-emergency": [
    "safety-policy",
    "emergency-assistance",
    "trip-safety-help",
    "share-trip",
    "report-emergency-issue",
  ],
};

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { section, article } = await params;

  if (LEGACY_SECTION_HUBS[section]?.includes(article)) {
    redirect(helpSectionPath(section));
  }

  const helpSection = getHelpSection(section);
  const helpArticle = getHelpArticle(section, article);
  if (
    helpSection &&
    helpArticle?.children?.length &&
    helpSection.articles.length === 1 &&
    helpSection.articles[0].id === article
  ) {
    redirect(helpSectionPath(section));
  }

  return <HelpArticleView sectionId={section} articleId={article} />;
}
