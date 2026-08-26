"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  /** Persistent sidebar on lg+, drawer on smaller screens. Default true. */
  showSidebar?: boolean;
  className?: string;
}

type AppShellSidebarCtx = {
  openSidebar: () => void;
  closeSidebar: () => void;
};

const AppShellSidebarContext = createContext<AppShellSidebarCtx | null>(null);

export function useAppShellSidebar() {
  return useContext(AppShellSidebarContext);
}

export function AppShell({
  children,
  showBottomNav = true,
  showSidebar = true,
  className,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const sidebarCtx = useMemo(
    () => ({ openSidebar, closeSidebar }),
    [openSidebar, closeSidebar],
  );

  return (
    <AppShellSidebarContext.Provider value={showSidebar ? sidebarCtx : null}>
      <div className="flex min-h-[100dvh] w-full min-w-0 overflow-x-clip bg-muted">
        {showSidebar ? (
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        ) : null}

        <div
          className={cn(
            "flex min-h-[100dvh] w-full min-w-0 flex-1 flex-col overflow-x-clip",
            showSidebar && "lg:pl-[280px]",
            showBottomNav && "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-0",
            className,
          )}
        >
          {children}
          {showBottomNav ? <BottomNav /> : null}
        </div>
      </div>
    </AppShellSidebarContext.Provider>
  );
}
