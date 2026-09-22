"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { bottomNavItems } from "@/constants/navigation";
import { ROUTES } from "@/constants/routes";
import { transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  if (href === ROUTES.home) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/10 bg-white/95 px-2 pt-1 shadow-[0_-8px_30px_-18px_rgba(40,54,20,0.35)] backdrop-blur-md supports-[backdrop-filter]:bg-white/88 sm:px-3 sm:pt-2 lg:hidden"
      style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex w-full max-w-lg items-stretch justify-between gap-1">
        {bottomNavItems.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              className="min-w-0 flex-1"
              whileTap={reduceMotion ? undefined : { scale: 0.92 }}
              transition={transitions.spring}
            >
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-9 min-w-0 flex-col items-center gap-0.5 rounded-2xl px-1 py-1 transition-colors sm:min-h-11 sm:gap-1 sm:px-1.5 sm:py-1.5",
                  active ? "text-primary" : "text-muted-foreground hover:text-primary/80",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-[12px] transition-all duration-200 sm:h-10 sm:w-10 sm:rounded-[14px]",
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "bg-transparent",
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={active ? 2.4 : 1.9} />
                </span>
                <span
                  className={cn(
                    "max-w-full truncate text-[9px] leading-none sm:text-[10px]",
                    active ? "font-semibold" : "font-medium",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}
