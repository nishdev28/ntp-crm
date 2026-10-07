import { Link } from "react-router-dom";
import { Search, Bell, Menu, Plus, CalendarDays } from "lucide-react";
import { format } from "date-fns";

/* Top bar: mobile menu, global search, date chip, notifications, primary action. */
export function Topbar({ onMenuClick }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          placeholder="Search leads, contacts, notes…"
          className="h-10 w-full rounded-xl border border-white/[0.08] bg-panel pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/15"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-panel px-3 text-xs text-slate-300 md:flex">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          {format(new Date(), "EEE, d MMM")}
        </div>

        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-panel text-slate-400 transition-colors hover:text-white cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-teal-400" />
        </button>

        <Link
          to="/leads"
          className="hidden h-10 items-center gap-1.5 rounded-xl bg-teal-400 px-4 text-[13px] font-semibold text-slate-950 transition-colors hover:bg-teal-300 sm:inline-flex"
        >
          <Plus className="h-4 w-4" />
          New lead
        </Link>
      </div>
    </header>
  );
}
