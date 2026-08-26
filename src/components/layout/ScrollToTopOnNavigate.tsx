"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollPageToTop(smooth: boolean) {
  const behavior: ScrollBehavior =
    smooth && !prefersReducedMotion() ? "smooth" : "auto";

  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTo({ top: 0, left: 0, behavior });
  document.body.scrollTo({ top: 0, left: 0, behavior });

  const roots = document.querySelectorAll<HTMLElement>(
    "[data-page-scroll], .bw-page-root, main",
  );
  roots.forEach((el) => {
    if (el.scrollHeight > el.clientHeight + 16) {
      el.scrollTo({ top: 0, left: 0, behavior });
    }
  });
}

function shouldScrollForAnchor(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;
  if (href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("sms:")) {
    return false;
  }
  if (anchor.closest("[data-no-scroll-top], [role='dialog'], [role='menu']")) {
    return false;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.hash) return false;
    return true;
  } catch {
    return false;
  }
}

/** Smoothly returns to the top after in-app navigation (links, BOOK, sidebar, etc.). */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;

    const frame = window.requestAnimationFrame(() => {
      scrollPageToTop(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-no-scroll-top], [role='dialog'], [role='menu']")) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (anchor instanceof HTMLAnchorElement && shouldScrollForAnchor(anchor)) {
        scrollPageToTop(true);
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
