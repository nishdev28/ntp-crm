import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Contact2,
  KanbanSquare,
  StickyNote,
  CalendarCheck,
  Settings,
  LogOut,
  Hexagon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui";

const SECTIONS = [
  {
    title: "Main",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
      { to: "/leads", label: "Leads", icon: Users },
      { to: "/contacts", label: "Contacts", icon: Contact2 },
    ],
  },
  {
    title: "Workflow",
    items: [
      { to: "/tasks", label: "Follow-ups", icon: CalendarCheck },
      { to: "/notes", label: "Notes", icon: StickyNote },
    ],
  },
  {
    title: "Tools",
    items: [{ to: "/settings", label: "Settings", icon: Settings }],
  },
];

function NavItem({ to, label, icon: Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors",
          isActive
            ? "bg-white/[0.05] text-white ring-1 ring-inset ring-white/10"
            : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-100"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* tree connector, like the reference */}
          <span
            aria-hidden
            className={cn(
              "absolute -left-[13px] top-1/2 h-px w-3 transition-colors",
              isActive ? "bg-teal-400/70" : "bg-white/10"
            )}
          />
          <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-teal-300" : "text-slate-500 group-hover:text-slate-300")} />
          <span className={cn(isActive && "font-medium")}>{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ onNavigate, className }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "flex w-60 flex-col rounded-2xl border border-white/[0.07] bg-panel select-none",
        className
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Hexagon className="h-5 w-5 text-teal-300" strokeWidth={2} />
        <span className="text-[15px] font-semibold tracking-tight text-white">NTP CRM</span>
      </div>
      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* Nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5 no-scrollbar">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <p className="mb-2 px-1 text-[10.5px] font-medium uppercase tracking-[0.12em] text-slate-500">
              {s.title}
            </p>
            {/* vertical guide line */}
            <div className="ml-3 space-y-0.5 border-l border-white/10 pl-3">
              {s.items.map((item) => (
                <NavItem key={item.to} {...item} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Account */}
      <div className="p-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-100">{user?.name || "User"}</p>
            <p className="truncate text-[11px] text-slate-500">{user?.email || ""}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
