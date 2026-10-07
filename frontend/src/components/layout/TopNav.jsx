import { NavLink, useNavigate, Link } from "react-router-dom";
import { Search, Bell, Menu, Plus, User, LogOut, KanbanSquare, ChevronDown } from "lucide-react";
import {
  Avatar,
  IconButton,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
} from "../ui";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

/* Centered text links — primary top navigation pill from reference layout */
const LINKS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/leads", label: "Leads" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/contacts", label: "Contacts" },
  { to: "/tasks", label: "Follow-ups" },
  { to: "/notes", label: "Notes" },
];

export function TopNav({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-3">
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition group-hover:bg-indigo-500">
            <KanbanSquare className="h-5 w-5" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="font-display text-base font-bold tracking-tight text-white leading-tight">
              NTP CRM
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Workspace
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Nav pill */}
      <nav className="mx-auto hidden items-center gap-1 rounded-full border border-slate-800 bg-slate-900/90 p-1.5 shadow-lg shadow-black/30 backdrop-blur-md lg:flex">
        {LINKS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-white shadow-xs border border-slate-700/70 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        <Link
          to="/leads"
          className="hidden sm:inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Lead</span>
        </Link>

        <button
          className="relative rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
        </button>

        <Dropdown
          trigger={
            <button className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 py-1 pl-1 pr-2.5 transition hover:bg-slate-800 hover:border-slate-700 cursor-pointer">
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          }
        >
          <DropdownLabel>{user?.email}</DropdownLabel>
          <DropdownSeparator />
          <DropdownItem onClick={() => navigate("/settings")}>
            <User className="h-4 w-4" /> Profile & Settings
          </DropdownItem>
          <DropdownItem danger onClick={logout}>
            <LogOut className="h-4 w-4" /> Log out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
