import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarRange,
  Plus,
  ArrowUpRight,
  Target,
  Layers,
  PieChart as PieIcon,
  CalendarClock,
  Trophy,
  Clock,
  AlertTriangle,
  Building2,
  DollarSign,
  TrendingUp,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { format, isPast, isToday } from "date-fns";
import { AiInsightsCard } from "../components/ai/AiInsightsCard";
import {
  Card,
  SectionHeading,
  Badge,
  Tabs,
  Skeleton,
  Avatar,
  Button,
} from "../components/ui";
import { analyticsApi, contactsApi, leadsApi, tasksApi } from "../lib/services";
import { currency, shortDate, timeOf } from "../lib/format";
import { STAGE_STYLES, PRIORITY_STYLES } from "../lib/constants";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

/* Chart palette */
const SOURCE_COLORS = ["#2dd4bf", "#38bdf8", "#a3e635", "#fbbf24", "#fb7185", "#66716f"];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [range, setRange] = useState("monthly");

  useEffect(() => {
    analyticsApi.overview().then(setData).catch(() => setData(false));
    contactsApi.list().then((res) => setContacts(res.contacts || [])).catch(() => {});
    leadsApi.list().then((res) => setLeads(res.leads || [])).catch(() => {});
    tasksApi.list().then((res) => setTasks(res.tasks || [])).catch(() => {});
  }, []);

  if (data === null) return <DashboardSkeleton />;
  const stats = data?.stats || {};

  // Trailing date-range label for the header
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const rangeLabel = `${format(start, "MMM d")} – ${format(today, "MMM d, yyyy")}`;

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
            Deals, revenue and follow-ups at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-1.5 rounded-xl border border-white/8 px-3 py-2 text-xs text-slate-300 sm:flex">
            <CalendarRange className="h-3.5 w-3.5 text-slate-400" />
            <span>{rangeLabel}</span>
          </div>
          <Link
            to="/leads"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-teal-400 px-3.5 text-xs font-semibold text-slate-950 hover:bg-teal-300 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Lead</span>
          </Link>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Layers} label="Total pipeline" value={currency(stats.pipelineValue)}
          note={`${stats.totalLeads ?? 0} deals tracked`} />
        <Kpi icon={DollarSign} label="Revenue won" value={currency(stats.revenueWon)}
          note="Closed-won deals" />
        <Kpi icon={Target} label="Win rate" value={`${stats.conversionRate ?? 0}%`}
          note="Qualified to won" />
        <Kpi icon={CalendarClock} label="Open follow-ups" value={stats.openTasks ?? 0}
          note="Scheduled tasks" />
      </div>

      {/* Main Content Composition (8 cols + 4 cols) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* ── Left Column (8 cols): Charts & Tables ── */}
        <div className="space-y-6 lg:col-span-8">
          {/* Pipeline Engagement Chart */}
          <Card className="p-5">
            <SectionHeading
              icon={TrendingUp}
              title="Pipeline velocity"
              subtitle="New leads per month"
              action={
                <Tabs
                  value={range}
                  onChange={setRange}
                  tabs={[
                    { value: "monthly", label: "Monthly" },
                    { value: "annually", label: "Annually" },
                  ]}
                />
              }
            />
            <div className="mt-5">
              <EngagementChart trend={data?.trend || []} />
            </div>
          </Card>

          {/* Pipeline by stage Breakdown */}
          <PipelineByStage pipeline={data?.pipeline || []} />

          {/* Recent activity Table */}
          <Card className="p-5">
            <SectionHeading
              icon={Briefcase}
              title="Recent activity"
              subtitle="Latest stage changes"
              to="/leads"
            />
            <div className="mt-3">
              <ActivityTable leads={data?.recentLeads || []} />
            </div>
          </Card>
        </div>

        {/* ── Right Column (4 cols): Action Items & Insights ── */}
        <div className="space-y-6 lg:col-span-4">
          {/* Upcoming Follow-ups */}
          <UpcomingTasks tasks={tasks} />

          {/* AI Pipeline Intelligence */}
          <AiInsightsCard />

          {/* Leads by Source */}
          <LeadsBySource leads={leads} />

          {/* Top Opportunities */}
          <TopDeals leads={leads} />
        </div>
      </div>
    </div>
  );
}

/* ── Pipeline by stage ──────────────────────────────────────────────── */
function PipelineByStage({ pipeline }) {
  const maxValue = Math.max(...pipeline.map((s) => s.value), 1);
  const totalValue = pipeline.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card className="p-5">
      <SectionHeading
        icon={Layers}
        title="Pipeline by stage"
        subtitle="Deal value by stage"
        to="/pipeline"
      />
      <div className="mt-4 space-y-3.5">
        {pipeline.map((s) => {
          const style = STAGE_STYLES[s.stage] || STAGE_STYLES.New;
          const pct = totalValue ? Math.round((s.value / totalValue) * 100) : 0;
          return (
            <div key={s.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-100">
                  <span className={cn("h-2 w-2 rounded-full", style.dot)} />
                  {s.stage}
                  <span className="text-slate-400">({s.count})</span>
                </span>
                <span className="font-semibold text-slate-50 tabular-nums">
                  {currency(s.value, { compact: true })}
                  <span className="ml-1 text-[11px] font-normal text-slate-400">
                    {pct}%
                  </span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn("h-full rounded-full transition-all", style.bar)}
                  style={{ width: `${Math.max((s.value / maxValue) * 100, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
        {pipeline.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-500">No active pipeline data available.</p>
        )}
      </div>
    </Card>
  );
}

/* ── Leads by source (clean Donut) ─────────────────────────────────── */
function LeadsBySource({ leads }) {
  const grouped = leads.reduce((acc, l) => {
    const key = l.source || "Other";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const dataset = Object.entries(grouped).map(([name, value]) => ({ name, value }));

  return (
    <Card className="p-5">
      <SectionHeading icon={PieIcon} title="Lead sources" subtitle="Where leads come from" />
      {dataset.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500">No lead sources recorded.</p>
      ) : (
        <div className="mt-3 flex items-center gap-4">
          <div className="relative h-32 w-32 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataset}
                  dataKey="value"
                  innerRadius={38}
                  outerRadius={56}
                  paddingAngle={2}
                  stroke="none"
                >
                  {dataset.map((_, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit=" leads" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-semibold text-slate-50 tabular-nums">{leads.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">leads</span>
            </div>
          </div>
          <ul className="flex-1 space-y-1.5">
            {dataset.map((d, i) => (
              <li key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300 truncate">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                  />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="font-semibold text-slate-50 tabular-nums ml-2">{d.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/* ── Upcoming Follow-ups ───────────────────────────────────────────── */
function UpcomingTasks({ tasks }) {
  const upcoming = tasks
    .filter((t) => t.status !== "Completed")
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 4);

  return (
    <Card className="p-5">
      <SectionHeading
        icon={CalendarClock}
        title="Follow-ups"
        subtitle="Due soon"
        to="/tasks"
      />
      {upcoming.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-400">All follow-ups completed.</p>
      ) : (
        <ul className="mt-3.5 space-y-2.5">
          {upcoming.map((t) => {
            const overdue = t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
            return (
              <li
                key={t._id}
                className="flex items-start gap-2.5 rounded-lg border border-white/[0.07] bg-white/[0.02] p-2.5 transition-colors hover:bg-white/[0.04]"
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                    overdue ? "bg-rose-400/10 text-rose-300" : "bg-white/[0.06] text-slate-300"
                  )}
                >
                  {overdue ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-50">{t.title}</p>
                  <p className={cn("text-[11px]", overdue ? "text-rose-300 font-medium" : "text-slate-500")}>
                    {t.dueDate ? shortDate(t.dueDate) : "No date"}
                    {t.relatedLead?.name ? ` · ${t.relatedLead.name}` : ""}
                  </p>
                </div>
                <Badge className={PRIORITY_STYLES[t.priority]}>{t.priority}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ── Top Deals ─────────────────────────────────────────────────────── */
function TopDeals({ leads }) {
  const deals = [...leads]
    .filter((l) => l.status !== "Won" && l.status !== "Lost")
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 5);

  return (
    <Card className="p-5">
      <SectionHeading icon={Trophy} title="Top open deals" subtitle="Highest value, still open" to="/leads" />
      {deals.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-500">No active opportunities.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {deals.map((l, i) => {
            const style = STAGE_STYLES[l.status] || STAGE_STYLES.New;
            return (
              <li
                key={l._id}
                className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[11px] font-semibold text-slate-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-50">{l.name}</p>
                    <p className="flex items-center gap-1 truncate text-[11px] text-slate-400">
                      <Building2 className="h-3 w-3 shrink-0" /> {l.company || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-semibold text-slate-50 tabular-nums">
                    {currency(l.value, { compact: true })}
                  </p>
                  <span className={cn("text-[10px] font-medium", style.badge)}>
                    {l.status}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ── Engagement Bar Chart ──────────────────────────────────────────── */
function EngagementChart({ trend }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#66716f", fontSize: 11 }}
          dy={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#66716f", fontSize: 11 }}
          width={40}
          tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
        />
        <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<ChartTooltip unit=" leads" />} />
        <Bar dataKey="leads" radius={[4, 4, 0, 0]} maxBarSize={32}>
          {trend.map((_, i) => (
            <Cell key={i} fill={i === trend.length - 1 ? "#2dd4bf" : "rgba(45,212,191,0.35)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartTooltip({ active, payload, label, prefix = "", unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-panel-2 px-3 py-2 shadow-xl shadow-black/50">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-slate-50 tabular-nums">
        {prefix}
        {Number(payload[0].value).toLocaleString()}
        {unit}
      </p>
    </div>
  );
}

/* ── Activity Table ────────────────────────────────────────────────── */
function ActivityTable({ leads }) {
  if (!leads.length)
    return <p className="py-8 text-center text-xs text-slate-500">No recent activity recorded.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/[0.07] text-left text-slate-500 font-medium">
            <th className="pb-2.5 font-medium">Lead & Company</th>
            <th className="pb-2.5 font-medium">Stage</th>
            <th className="pb-2.5 text-right font-medium">Deal Value</th>
            <th className="pb-2.5 text-right font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {leads.map((l) => {
            const style = STAGE_STYLES[l.status] || STAGE_STYLES.New;
            return (
              <tr
                key={l.id}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={l.name} size="sm" />
                    <div>
                      <p className="font-semibold text-slate-50">{l.name}</p>
                      <p className="text-[11px] text-slate-400">{l.company || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <Badge className={style.badge} dot={style.dot}>
                    {l.status}
                  </Badge>
                </td>
                <td className="py-3 text-right font-semibold text-slate-50 tabular-nums">
                  {currency(l.value)}
                </td>
                <td className="py-3 text-right text-slate-500 tabular-nums">
                  {shortDate(l.updatedAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, note }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-300">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-[26px] font-semibold leading-none tracking-tight text-white tabular-nums">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-60 rounded-xl" />
          <Skeleton className="h-60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
