"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Headphones } from "lucide-react";
import { getHelpArticle, getHelpSection } from "@/data/help-center";
import { helpArticlePath, helpSectionPath } from "@/lib/help-routes";
import { ROUTES } from "@/constants/routes";
import {
  HelpArticleLinkButton,
  HelpContentBlocks,
  HelpIssueForm,
  HelpToggleList,
  HelpTripSelector,
} from "@/components/profile/help/HelpArticleParts";
import {
  HelpFaqList,
  HelpLegalDocument,
} from "@/components/profile/help/HelpRemoteContent";
import {
  HelpArticleRow,
  HelpTopicShell,
  articleIcon,
} from "@/components/profile/help/HelpTopicShell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HelpArticleViewProps {
  sectionId: string;
  articleId: string;
}

function isUnwrappedHub(sectionId: string, parentId?: string) {
  const section = getHelpSection(sectionId);
  if (!section || !parentId) return false;
  return section.articles.length === 1 && section.articles[0].id === parentId;
}

export function HelpArticleView({ sectionId, articleId }: HelpArticleViewProps) {
  const section = getHelpSection(sectionId);
  const article = getHelpArticle(sectionId, articleId);

  if (!section || !article) {
    notFound();
  }

  const unwrapParent = isUnwrappedHub(sectionId, article.parentId);
  const backHref =
    article.parentId && !unwrapParent
      ? helpArticlePath(sectionId, article.parentId)
      : helpSectionPath(sectionId);
  const backLabel =
    article.parentId && !unwrapParent
      ? `Back to ${article.parentTitle}`
      : `Back to ${section.title}`;

  const breadcrumb = {
    sectionTitle: section.title,
    sectionId,
    parentTitle: unwrapParent ? undefined : article.parentTitle,
    parentId: unwrapParent ? undefined : article.parentId,
  };

  if (article.children && article.children.length > 0) {
    return (
      <HelpTopicShell title={article.title} breadcrumb={breadcrumb} backHref={backHref}>
        <div className="flex w-full flex-col gap-2.5 sm:gap-3">
          {article.children.map((child) => (
            <HelpArticleRow
              key={child.id}
              title={child.title}
              icon={articleIcon(child.title)}
              href={helpArticlePath(sectionId, child.id)}
            />
          ))}
        </div>
      </HelpTopicShell>
    );
  }

  const hideContact =
    article.kind === "trip-form" ||
    article.kind === "dispute-form" ||
    article.kind === "report-form";

  return (
    <HelpTopicShell
      title={article.title}
      breadcrumb={breadcrumb}
      backHref={backHref}
    >
      <div className="w-full max-w-3xl space-y-4">
        {article.paragraphs?.length || article.numberedList?.length ? (
          <HelpContentBlocks
            paragraphs={article.paragraphs}
            numberedList={article.numberedList}
          />
        ) : null}

        {article.kind === "legal-doc" && article.legalSource ? (
          <HelpLegalDocument source={article.legalSource} />
        ) : null}

        {article.kind === "faq" && article.faqCategory ? (
          <HelpFaqList category={article.faqCategory} match={article.faqMatch} />
        ) : null}

        {article.link ? (
          <HelpArticleLinkButton link={article.link} sectionId={sectionId} />
        ) : null}

        {article.relatedLinks && article.relatedLinks.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {article.relatedLinks.map((link) => (
              <HelpArticleLinkButton
                key={`${link.label}-${link.href ?? link.articleId}`}
                link={link}
                sectionId={sectionId}
              />
            ))}
          </div>
        ) : null}

        {article.kind === "trip-form" ? (
          <HelpTripSelector submitLabel="Submit" topic={article.title} />
        ) : null}

        {article.kind === "dispute-form" && article.toggles ? (
          <>
            <HelpToggleList toggles={article.toggles} />
            <HelpTripSelector submitLabel="Submit" showDate topic={article.title} />
          </>
        ) : null}

        {article.kind === "report-form" && article.toggles ? (
          <>
            <HelpToggleList toggles={article.toggles} />
            <HelpTripSelector submitLabel="Submit" topic={article.title} />
          </>
        ) : null}

        {article.kind === "report-form" && !article.toggles ? (
          <HelpIssueForm
            topic={article.title}
            category={sectionId === "safety-emergency" ? "safety" : "map"}
            placeLabel={
              sectionId === "safety-emergency"
                ? "Trip or location (optional)"
                : "Place, road, or landmark"
            }
          />
        ) : null}

        <div className="flex flex-col gap-3 border-t border-[#e5e7df] pt-6 sm:flex-row sm:flex-wrap">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 w-full justify-center rounded-xl border-[#d9dece] sm:w-auto",
            )}
          >
            {backLabel}
          </Link>
          {!hideContact ? (
            <Link
              href={ROUTES.profileHelpMessages}
              className={cn(
                buttonVariants(),
                "h-11 w-full justify-center gap-2 rounded-xl sm:w-auto",
              )}
            >
              <Headphones className="h-4 w-4" />
              Contact support
            </Link>
          ) : null}
        </div>
      </div>
    </HelpTopicShell>
  );
}
