import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Sparkles, GripVertical, Building2, TrendingUp, Layers, Target, DollarSign } from "lucide-react";
import { PageHeader } from "../components/common/PageHeader";
import { Spinner, Avatar, Badge, Card } from "../components/ui";
import { leadsApi, aiApi } from "../lib/services";
import { currency } from "../lib/format";
import { PIPELINE_STAGES, STAGE_STYLES, PRIORITY_STYLES } from "../lib/constants";
import { cn } from "../lib/utils";
import { toast } from "sonner";

/* Group a flat lead list into { stage: Lead[] } buckets. */
const toBoard = (leads) => {
  const board = Object.fromEntries(PIPELINE_STAGES.map((s) => [s, []]));
  for (const l of leads) (board[l.status] || board.New).push(l);
  return board;
};

export default function Pipeline() {
  const [board, setBoard] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    leadsApi
      .list()
      .then((res) => setBoard(toBoard(res.leads)))
      .catch(() => setBoard(toBoard([])));
  }, []);

  if (!board) return <Spinner />;

  const findContainer = (id) => {
    if (id in board) return id;
    return PIPELINE_STAGES.find((s) => board[s].some((l) => l._id === id));
  };

  const activeLead = activeId
    ? Object.values(board).flat().find((l) => l._id === activeId)
    : null;

  /* Move cards between columns live as the user drags over them. */
  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const from = findContainer(active.id);
    const to = findContainer(over.id);
    if (!from || !to || from === to) return;

    setBoard((prev) => {
      const fromItems = [...prev[from]];
      const toItems = [...prev[to]];
      const idx = fromItems.findIndex((l) => l._id === active.id);
      if (idx === -1) return prev;
      const [moved] = fromItems.splice(idx, 1);
      moved.status = to;
      const overIdx = toItems.findIndex((l) => l._id === over.id);
      toItems.splice(overIdx === -1 ? toItems.length : overIdx, 0, moved);
      return { ...prev, [from]: fromItems, [to]: toItems };
    });
  };

  /* Persist the final ordering + stage to the backend. */
  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const container = findContainer(over.id);
    if (!container) return;

    setBoard((prev) => {
      const items = [...prev[container]];
      const oldIdx = items.findIndex((l) => l._id === active.id);
      const newIdx = items.findIndex((l) => l._id === over.id);
      const reordered =
        oldIdx !== -1 && newIdx !== -1 ? arrayMove(items, oldIdx, newIdx) : items;
      const next = { ...prev, [container]: reordered };

      const updates = [];
      PIPELINE_STAGES.forEach((stage) => {
        next[stage].forEach((l, order) =>
          updates.push({ id: l._id, status: stage, order })
        );
      });
      leadsApi.reorder(updates).catch(() => toast.error("Could not save pipeline"));
      return next;
    });
  };

  /* ── KPI computations ─────────────────────────────────────────────── */
  const allLeads = Object.values(board).flat();
  const totalValue = allLeads.reduce((s, l) => s + (l.value || 0), 0);
  const openDeals = allLeads.filter((l) => l.status !== "Won" && l.status !== "Lost");
  const wonLeads = allLeads.filter((l) => l.status === "Won");
  const wonValue = wonLeads.reduce((s, l) => s + (l.value || 0), 0);
  const closedCount = wonLeads.length + (board.Lost?.length || 0);
  const winRate = closedCount > 0 ? Math.round((wonLeads.length / closedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deal Pipeline"
        subtitle={`${allLeads.length} active opportunities · ${currency(totalValue, { compact: true })} total pipeline`}
      />

      {/* KPI summary strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={DollarSign}
          tint="bg-blue-500/10 text-blue-400"
          label="Total pipeline"
          value={currency(totalValue, { compact: true })}
        />
        <StatTile
          icon={Layers}
          tint="bg-indigo-500/10 text-indigo-400"
          label="Open deals"
          value={openDeals.length}
        />
        <StatTile
          icon={Target}
          tint="bg-emerald-500/10 text-emerald-400"
          label="Won value"
          value={currency(wonValue, { compact: true })}
        />
        <StatTile
          icon={TrendingUp}
          tint="bg-amber-500/10 text-amber-400"
          label="Win rate"
          value={`${winRate}%`}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {PIPELINE_STAGES.map((stage) => (
            <Column key={stage} stage={stage} leads={board[stage]} />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} overlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

/* ── KPI stat tile ─────────────────────────────────────────────────── */
function StatTile({ icon: Icon, label, value, tint }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tint)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-lg font-bold text-slate-50 tabular-nums">{value}</p>
        </div>
      </div>
    </Card>
  );
}

/* ── Column ─────────────────────────────────────────────────────────── */
function Column({ stage, leads }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const style = STAGE_STYLES[stage];
  const value = leads.reduce((s, l) => s + (l.value || 0), 0);

  return (
    <div className="flex w-76 shrink-0 flex-col">
      {/* Column header */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", style.dot)} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-100">{stage}</h3>
          <span className="rounded bg-slate-700 px-1.5 py-0.2 text-[11px] font-semibold text-slate-300 tabular-nums">
            {leads.length}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 tabular-nums">
          {currency(value, { compact: true })}
        </span>
      </div>

      {/* Droppable column body */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[62vh] flex-1 flex-col gap-2.5 rounded-xl border border-slate-800/70 bg-white/[0.02] p-2.5 transition-colors",
          isOver && "border-indigo-500/25 bg-indigo-500/10"
        )}
      >
        <SortableContext
          items={leads.map((l) => l._id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <SortableCard key={lead._id} lead={lead} />
          ))}
        </SortableContext>
        {leads.length === 0 && (
          <div className="flex flex-1 items-center justify-center border border-dashed border-slate-800 rounded-lg p-6">
            <p className="text-xs text-slate-400">Empty stage</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sortable card wrapper ──────────────────────────────────────────── */
function SortableCard({ lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead._id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "opacity-40")}
    >
      <LeadCard lead={lead} dragHandle={{ attributes, listeners }} />
    </div>
  );
}

/* ── Card UI ────────────────────────────────────────────────────────── */
function LeadCard({ lead, dragHandle, overlay }) {
  const [suggesting, setSuggesting] = useState(false);

  const suggest = async (e) => {
    e.stopPropagation();
    setSuggesting(true);
    try {
      const res = await aiApi.leadSummary({ leadId: lead._id });
      toast(`AI suggestion for ${lead.name}`, {
        description: `${res.nextBestAction} (suggested priority: ${res.suggestedPriority})`,
        duration: 7000,
      });
    } catch (err) {
      toast.error(err.message || "AI unavailable");
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div
      className={cn(
        "group rounded-lg bg-slate-900 p-3 border border-slate-800/90 shadow-2xs transition-all",
        overlay ? "shadow-lg rotate-1 border-slate-700" : "hover:border-slate-700 hover:shadow-xs"
      )}
    >
      {/* Name / company row + drag handle */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={lead.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-50 leading-tight">{lead.name}</p>
            <p className="flex items-center gap-1 truncate text-[11px] text-slate-400 leading-tight mt-0.5">
              <Building2 className="h-3 w-3 shrink-0" />
              {lead.company || "—"}
            </p>
          </div>
        </div>
        {dragHandle && (
          <button
            {...dragHandle.attributes}
            {...dragHandle.listeners}
            className="cursor-grab text-slate-300 hover:text-slate-300 transition-colors p-0.5 active:cursor-grabbing"
            aria-label="Drag"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Value + priority */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs font-bold text-slate-50 tabular-nums">{currency(lead.value)}</span>
        <Badge className={PRIORITY_STYLES[lead.priority]}>{lead.priority}</Badge>
      </div>

      {/* AI assist button */}
      {!overlay && (
        <button
          onClick={suggest}
          disabled={suggesting}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-800/80 bg-slate-800/40 py-1 text-[11px] font-medium text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-800 hover:text-slate-50 transition-all cursor-pointer disabled:opacity-60"
        >
          <Sparkles className={cn("h-3 w-3 text-slate-500", suggesting && "animate-pulse")} />
          <span>{suggesting ? "Analyzing..." : "Suggest Next Action"}</span>
        </button>
      )}
    </div>
  );
}
