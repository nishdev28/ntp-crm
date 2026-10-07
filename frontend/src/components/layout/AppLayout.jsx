import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

/**
 * Authenticated shell:
 *  - Floating rounded sidebar on the left (drawer on mobile)
 *  - Slim top bar with search + quick actions
 *  - Scrollable content region on a near-black canvas
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-canvas text-slate-100">
      {/* Faint teal wash at the top edge — the only decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(47,184,162,0.10),transparent)]"
      />

      {/* Desktop sidebar */}
      <div className="relative hidden shrink-0 p-3 pr-0 lg:block">
        <Sidebar className="h-full" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full p-3 animate-fade-up">
            <Sidebar className="h-full" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-2 md:px-6">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
