import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  TrendingUp,
  Trophy,
  Coins,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  X,
  LayoutGrid,
  Table2,
  Download,
  Building2,
} from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { LeadFormDialog } from "../components/leads/LeadFormDialog";
import { LeadDrawer } from "../components/leads/LeadDrawer";
import {
  Card,
  Button,
  Badge,
  Avatar,
  Select,
  Dropdown,
  DropdownItem,
  Spinner,
} from "../components/ui";
import { leadsApi } from "../lib/services";
import { currency, relative } from "../lib/format";
import {
  LEAD_STAGES,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  STAGE_STYLES,
  PRIORITY_STYLES,
} from "../lib/constants";
import { cn } from "../lib/utils";
import { toast } from "sonner";

export default function Leads() {
  const [leads, setLeads] = useState(null);
  const [filters, setFilters] = useState({ status: "", priority: "", source: "", search: "" });
  const [sort, setSort] = useState({ key: "updatedAt", dir: "desc" });
  const [selected, setSelected] = useState(() => new Set());
  const [view, setView] = useState("table"); // "table" | "grid"

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [drawerLead, setDrawerLead] = useState(null);
  const [toDelete, setToDelete] = useState(null); // single lead
  const [bulkOpen, setBulkOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLeads(null);
    setSelected(new Set());
    leadsApi.list().then((res) => setLeads(res.leads)).catch(() => setLeads([]));
  };
  useEffect(load, []);

  /* ── Derived data ─────────────────────────────────────────────────── */
  // Counts per stage drive the quick-filter chips (independent of the active
  // stage filter so the numbers stay stable).
  const stageCounts = useMemo(() => {
    const c = { All: leads?.length || 0 };
    LEAD_STAGES.forEach((s) => (c[s] = 0));
    (leads || []).forEach((l) => (c[l.status] = (c[l.status] || 0) + 1));
    return c;
  }, [leads]);

  const kpis = useMemo(() => {
    const list = leads || [];
    const open = list.filter((l) => l.status !== "Won" && l.status !== "Lost");
    const openValue = open.reduce((s, l) => s + (l.value || 0), 0);
    const wonValue = list
      .filter((l) => l.status === "Won")
      .reduce((s, l) => s + (l.value || 0), 0);
    const total = list.reduce((s, l) => s + (l.value || 0), 0);
    return {
      count: list.length,
      openValue,
      wonValue,
      avg: list.length ? Math.round(total / list.length) : 0,
    };
  }, [leads]);

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((l) => {
      if (filters.status && l.status !== filters.status) return false;
      if (filters.priority && l.priority !== filters.priority) return false;
      if (filters.source && l.source !== filters.source) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          l.name?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [leads, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const { key, dir } = sort;
    arr.sort((a, b) => {
      let av, bv;
      if (key === "name") {
        av = a.name?.toLowerCase() || "";
        bv = b.name?.toLowerCase() || "";
      } else if (key === "value") {
        av = a.value || 0;
        bv = b.value || 0;
      } else {
        av = new Date(a.updatedAt).getTime();
        bv = new Date(b.updatedAt).getTime();
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sort]);

  const filtersActive =
    filters.status || filters.priority || filters.source || filters.search;

  /* ── Handlers ─────────────────────────────────────────────────────── */
  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" }
    );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (lead) => {
    setDrawerLead(null);
    setEditing(lead);
    setFormOpen(true);
  };

  const toggleRow = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allVisibleSelected =
    sorted.length > 0 && sorted.every((l) => selected.has(l._id));
  const toggleAll = () =>
    setSelected(allVisibleSelected ? new Set() : new Set(sorted.map((l) => l._id)));

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await leadsApi.remove(toDelete._id);
      toast.success("Lead deleted");
      setToDelete(null);
      setDrawerLead(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    setDeleting(true);
    try {
      await Promise.all([...selected].map((id) => leadsApi.remove(id)));
      toast.success(`${selected.size} leads deleted`);
      setBulkOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  /* Export to CSV. If rows are checked, export just those; otherwise export
     the current filtered + sorted view. */
  const exportCSV = () => {
    const rows = selected.size > 0 ? sorted.filter((l) => selected.has(l._id)) : sorted;
    if (!rows.length) {
      toast.error("Nothing to export");
      return;
    }
    const headers = [
      "Name", "Company", "Email", "Phone", "Stage",
      "Priority", "Source", "Value", "Created", "Updated",
    ];
    // Escape values containing commas, quotes or newlines per RFC 4180.
    const esc = (v) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
    const lines = [headers.join(",")];
    rows.forEach((l) =>
      lines.push(
        [
          l.name, l.company, l.email, l.phone, l.status,
          l.priority, l.source, l.value, day(l.createdAt), day(l.updatedAt),
        ]
          .map(esc)
          .join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} ${rows.length === 1 ? "lead" : "leads"}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Leads Directory" subtitle="Track, qualify and progress prospective customer opportunities.">
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> Add Lead
        </Button>
      </PageHeader>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Users} tint="bg-blue-500/10 text-blue-400" label="Total leads" value={kpis.count} />
        <StatTile
          icon={TrendingUp}
          tint="bg-indigo-500/10 text-indigo-400"
          label="Open pipeline"
          value={currency(kpis.openValue, { compact: true })}
        />
        <StatTile
          icon={Trophy}
          tint="bg-emerald-500/10 text-emerald-400"
          label="Won value"
          value={currency(kpis.wonValue, { compact: true })}
        />
        <StatTile
          icon={Coins}
          tint="bg-amber-500/10 text-amber-400"
          label="Avg deal size"
          value={currency(kpis.avg, { compact: true })}
        />
      </div>

      {/* Toolbar */}
      <Card className="space-y-3.5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by name, company, or email..."
              className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-3 text-xs text-slate-50 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 lg:flex">
            <Filter
              value={filters.priority}
              onChange={(v) => setFilters({ ...filters, priority: v })}
              all="All priority"
              options={LEAD_PRIORITIES}
            />
            <Filter
              value={filters.source}
              onChange={(v) => setFilters({ ...filters, source: v })}
              all="All sources"
              options={LEAD_SOURCES}
            />
          </div>
        </div>

        {/* Stage quick-filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
          <StageChip
            label="All"
            count={stageCounts.All}
            active={!filters.status}
            onClick={() => setFilters({ ...filters, status: "" })}
          />
          {LEAD_STAGES.map((s) => (
            <StageChip
              key={s}
              label={s}
              count={stageCounts[s]}
              dot={STAGE_STYLES[s]?.dot}
              active={filters.status === s}
              onClick={() => setFilters({ ...filters, status: s })}
            />
          ))}

          <div className="ml-auto flex items-center gap-3">
            {filtersActive && (
              <button
                onClick={() => setFilters({ status: "", priority: "", source: "", search: "" })}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-50 cursor-pointer"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
            <span className="text-xs text-slate-400 font-medium">
              <span className="font-semibold text-slate-200 tabular-nums">{sorted.length}</span> of{" "}
              {leads?.length ?? 0}
            </span>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </Card>

      {/* Results — table or card grid */}
      {leads === null ? (
        <Card className="p-12 flex justify-center">
          <Spinner />
        </Card>
      ) : sorted.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No leads found"
            description={
              filtersActive
                ? "Try adjusting your search criteria or clearing filters."
                : "Add your first lead to start building your sales pipeline."
            }
            action={
              <Button size="sm" onClick={openNew}>
                <Plus className="h-3.5 w-3.5" /> Add Lead
              </Button>
            }
          />
        </Card>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((l) => (
            <LeadGridCard
              key={l._id}
              lead={l}
              selected={selected.has(l._id)}
              onToggle={() => toggleRow(l._id)}
              onOpen={() => setDrawerLead(l)}
              onEdit={openEdit}
              onDelete={setToDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-slate-800 bg-slate-800/40 text-slate-500">
                <tr className="text-left uppercase tracking-wider text-[11px]">
                  <th className="w-10 pl-4 py-3">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      className="h-3.5 w-3.5 rounded border-slate-700 accent-slate-900 cursor-pointer"
                      aria-label="Select all"
                    />
                  </th>
                  <SortTh label="Lead & Company" k="name" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <SortTh label="Deal Value" k="value" sort={sort} onSort={toggleSort} align="right" />
                  <SortTh label="Updated" k="updatedAt" sort={sort} onSort={toggleSort} />
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sorted.map((l) => {
                  const stage = STAGE_STYLES[l.status] || STAGE_STYLES.New;
                  const isSel = selected.has(l._id);
                  return (
                    <tr
                      key={l._id}
                      onClick={() => setDrawerLead(l)}
                      className={cn(
                        "group cursor-pointer transition-colors",
                        isSel ? "bg-slate-800/60" : "hover:bg-slate-800/40"
                      )}
                    >
                      <td className="pl-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={() => toggleRow(l._id)}
                          className="h-3.5 w-3.5 rounded border-slate-700 accent-slate-900 cursor-pointer"
                          aria-label={`Select ${l.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={l.name} size="sm" />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-50 leading-tight">{l.name}</p>
                            <p className="text-[11px] text-slate-400 leading-tight truncate">
                              {l.company || l.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={stage.badge} dot={stage.dot}>
                          {l.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={PRIORITY_STYLES[l.priority]}>{l.priority}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                          {l.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-50 tabular-nums">
                        {currency(l.value)}
                      </td>
                      <td className="px-4 py-3 text-slate-400 tabular-nums">{relative(l.updatedAt)}</td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Dropdown
                            trigger={
                              <button className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            }
                          >
                            <DropdownItem onClick={() => openEdit(l)}>
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </DropdownItem>
                            <DropdownItem danger onClick={() => setToDelete(l)}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </DropdownItem>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Floating bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 shadow-xl animate-fade-up">
          <span className="text-xs font-semibold text-slate-50 tabular-nums">
            {selected.size} selected
          </span>
          <div className="h-3.5 w-px bg-slate-700" />
          <button
            onClick={() => setSelected(new Set())}
            className="text-xs text-slate-500 hover:text-slate-50 transition-colors cursor-pointer font-medium"
          >
            Clear selection
          </button>
          <Button size="sm" variant="danger" onClick={() => setBulkOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}

      {/* Dialogs / drawer */}
      <LeadFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        lead={editing}
        onSaved={load}
      />
      <LeadDrawer
        open={Boolean(drawerLead)}
        onClose={() => setDrawerLead(null)}
        lead={drawerLead}
        onEdit={openEdit}
        onDelete={setToDelete}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this lead?"
        description={`"${toDelete?.name}" will be permanently removed.`}
      />
      <ConfirmDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onConfirm={confirmBulkDelete}
        loading={deleting}
        title={`Delete ${selected.size} leads?`}
        description="These leads will be permanently removed. This action cannot be undone."
      />
    </div>
  );
}

/* ── Table / grid view toggle ───────────────────────────────────────── */
function ViewToggle({ view, onChange }) {
  const options = [
    { value: "table", icon: Table2, label: "Table view" },
    { value: "grid", icon: LayoutGrid, label: "Card view" },
  ];
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-slate-800 bg-slate-800 p-0.5">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          title={label}
          aria-label={label}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer",
            view === value ? "bg-slate-900 text-slate-50 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-50"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

/* ── Card used in the grid view ─────────────────────────────────────── */
function LeadGridCard({ lead, selected, onToggle, onOpen, onEdit, onDelete }) {
  const stage = STAGE_STYLES[lead.status] || STAGE_STYLES.New;
  return (
    <div
      onClick={onOpen}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-slate-900 p-4 shadow-2xs transition-all hover:border-slate-700 hover:shadow-xs",
        selected ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-800"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={lead.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-50 leading-tight">{lead.name}</p>
            <p className="flex items-center gap-1 truncate text-[11px] text-slate-400 mt-0.5 leading-tight">
              <Building2 className="h-3 w-3 shrink-0" /> {lead.company || lead.email || "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="h-3.5 w-3.5 rounded border-slate-700 accent-slate-900 cursor-pointer"
            aria-label={`Select ${lead.name}`}
          />
          <Dropdown
            trigger={
              <button className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            }
          >
            <DropdownItem onClick={() => onEdit(lead)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownItem>
            <DropdownItem danger onClick={() => onDelete(lead)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <Badge className={stage.badge} dot={stage.dot}>
          {lead.status}
        </Badge>
        <Badge className={PRIORITY_STYLES[lead.priority]}>{lead.priority}</Badge>
        <span className="inline-flex rounded bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
          {lead.source}
        </span>
      </div>

      <div className="mt-3.5 flex items-end justify-between border-t border-slate-800 pt-3">
        <div>
          <p className="text-[11px] text-slate-400">Deal value</p>
          <p className="text-base font-bold text-slate-50 tabular-nums">{currency(lead.value)}</p>
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums">{relative(lead.updatedAt)}</span>
      </div>
    </div>
  );
}

/* ── Small building blocks ──────────────────────────────────────────── */

function StatTile({ icon: Icon, label, value, tint }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tint)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <p className="text-lg font-bold text-slate-50 tabular-nums">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function StageChip({ label, count, dot, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-2xs font-semibold"
          : "border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-50 hover:bg-slate-800/40"
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", active ? "bg-slate-900" : dot)} />}
      <span>{label}</span>
      <span
        className={cn(
          "rounded px-1.5 py-0.2 text-[10px] font-semibold tabular-nums",
          active ? "bg-slate-800 text-slate-200" : "bg-slate-800 text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SortTh({ label, k, sort, onSort, align = "left" }) {
  const active = sort.key === k;
  return (
    <th className={cn("px-4 py-3 font-medium", align === "right" && "text-right")}>
      <button
        onClick={() => onSort(k)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-slate-50 cursor-pointer",
          active && "text-slate-50 font-semibold"
        )}
      >
        <span>{label}</span>
        <span className="text-slate-400">
          {active ? (
            sort.dir === "asc" ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )
          ) : (
            <ChevronDown className="h-3 w-3 opacity-30" />
          )}
        </span>
      </button>
    </th>
  );
}

function Filter({ value, onChange, all, options }) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} className="lg:w-36 text-xs h-9">
      <option value="">{all}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </Select>
  );
}

