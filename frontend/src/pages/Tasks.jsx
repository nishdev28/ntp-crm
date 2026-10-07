/**
 * Tasks / Follow-ups page — premium upgrade
 * Grouped timeline view (Overdue → Due Today → Upcoming → No date → Completed),
 * completion progress bar, priority accent bars, and full CRUD.
 */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isPast, isToday } from "date-fns";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarCheck,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock,
  AlertTriangle,
  Building2,
} from "lucide-react";

import { PageHeader } from "../components/common/PageHeader";
import { EmptyState } from "../components/common/EmptyState";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { StatCard } from "../components/common/StatCard";

import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Field,
  Badge,
  Dialog,
  Dropdown,
  DropdownItem,
  Tabs,
  Spinner,
} from "../components/ui";

import { tasksApi, leadsApi } from "../lib/services";
import { shortDate, dateInputValue } from "../lib/format";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUS_STYLES,
  PRIORITY_STYLES,
} from "../lib/constants";
import { cn } from "../lib/utils";

// ─── Priority accent bar colours ──────────────────────────────────────────────
const PRIORITY_BAR = {
  High: "bg-rose-500",
  Medium: "bg-amber-500",
  Low: "bg-slate-300",
};

// ─── Group definitions (in display order) ────────────────────────────────────
const GROUPS = [
  { key: "overdue",   label: "Overdue",      labelClass: "text-rose-400",   countClass: "bg-rose-500/10 text-rose-400 border border-rose-500/25" },
  { key: "today",     label: "Due today",    labelClass: "text-amber-400",  countClass: "bg-amber-500/10 text-amber-400 border border-amber-500/25" },
  { key: "upcoming",  label: "Upcoming",     labelClass: "text-slate-100",  countClass: "bg-slate-800 text-slate-200" },
  { key: "nodate",    label: "No due date",  labelClass: "text-slate-500",  countClass: "bg-slate-800 text-slate-500" },
  { key: "completed", label: "Completed",    labelClass: "text-emerald-400", countClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" },
];

// ─── Tab definitions ──────────────────────────────────────────────────────────
const STATUS_TABS = [
  { value: "all",         label: "All" },
  { value: "Pending",     label: "Pending" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed",   label: "Completed" },
];

// ─── Helper: is a task overdue (has past dueDate, not completed)? ─────────────
function isOverdue(task) {
  if (!task.dueDate || task.status === "Completed") return false;
  const d = new Date(task.dueDate);
  return isPast(d) && !isToday(d);
}

// ─── Helper: assign a task to a group key ────────────────────────────────────
function groupKey(task) {
  if (task.status === "Completed") return "completed";
  if (!task.dueDate) return "nodate";
  const d = new Date(task.dueDate);
  if (isToday(d)) return "today";
  if (isPast(d)) return "overdue";
  return "upcoming";
}

// ─── Add / Edit dialog (declared at module level — no component-in-component) ─
function TaskFormDialog({ open, onClose, task, leads, onSaved }) {
  const isEdit = Boolean(task);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Reset form whenever the dialog opens or the target task changes.
  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title:       task.title ?? "",
              description: task.description ?? "",
              dueDate:     dateInputValue(task.dueDate),
              status:      task.status ?? "Pending",
              priority:    task.priority ?? "Medium",
              relatedLead: task.relatedLead?._id ?? "",
            }
          : {
              title: "", description: "", dueDate: "",
              status: "Pending", priority: "Medium", relatedLead: "",
            }
      );
    }
  }, [open, task, reset]);

  const onSubmit = async (values) => {
    const payload = {
      title:       values.title.trim(),
      description: values.description?.trim() || undefined,
      dueDate:     values.dueDate || undefined,
      status:      values.status,
      priority:    values.priority,
      relatedLead: values.relatedLead || null,
    };
    try {
      if (isEdit) {
        await tasksApi.update(task._id, payload);
        toast.success("Task updated");
      } else {
        await tasksApi.create(payload);
        toast.success("Task created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.message ?? "Something went wrong");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Task" : "New Task"}
      description={isEdit ? "Update follow-up commitment details." : "Create a new follow-up commitment."}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Title */}
        <Field label="Task Title" error={errors.title?.message}>
          <Input
            placeholder="e.g. Follow up on proposal terms"
            {...register("title", { required: "Title is required" })}
          />
        </Field>

        {/* Description */}
        <Field label="Notes & Context">
          <Textarea rows={3} placeholder="Additional context..." {...register("description")} />
        </Field>

        {/* Due date + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Due Date">
            <Input type="date" {...register("dueDate")} />
          </Field>
          <Field label="Priority">
            <Select {...register("priority")}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Status */}
        <Field label="Status">
          <Select {...register("status")}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>

        {/* Linked lead */}
        <Field label="Associated Deal / Lead">
          <Select {...register("relatedLead")}>
            <option value="">No linked lead</option>
            {leads.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}{l.company ? ` — ${l.company}` : ""}
              </option>
            ))}
          </Select>
        </Field>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            {isEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ─── Single task row (module-level component) ─────────────────────────────────
function TaskRow({ task, onToggle, onEdit, onDelete }) {
  const done    = task.status === "Completed";
  const inProg  = task.status === "In Progress";
  const overdue = isOverdue(task);
  const dueToday = task.dueDate ? isToday(new Date(task.dueDate)) : false;

  return (
    <div className="group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-800/40">
      {/* Priority accent bar */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r",
          PRIORITY_BAR[task.priority] ?? "bg-slate-300"
        )}
      />

      {/* Status toggle */}
      <button
        onClick={() => onToggle(task)}
        aria-label={done ? "Mark as pending" : "Mark as completed"}
        className={cn(
          "mt-0.5 shrink-0 rounded p-0.5 transition-colors cursor-pointer",
          done
            ? "text-emerald-400 hover:text-emerald-400"
            : inProg
            ? "text-teal-400 hover:text-slate-50"
            : "text-slate-300 hover:text-slate-300"
        )}
      >
        {done ? (
          <CheckCircle2 className="h-4.5 w-4.5" />
        ) : inProg ? (
          <CircleDot className="h-4.5 w-4.5" />
        ) : (
          <Circle className="h-4.5 w-4.5" />
        )}
      </button>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <p
          className={cn(
            "text-xs font-semibold leading-snug",
            done ? "line-through text-slate-400" : "text-slate-50"
          )}
        >
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p className="mt-0.5 truncate text-[11px] text-slate-400">{task.description}</p>
        )}

        {/* Meta chips */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {/* Due date chip */}
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[10px] font-medium tabular-nums",
                overdue
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                  : dueToday
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                  : "bg-slate-800 text-slate-300"
              )}
            >
              {overdue ? (
                <AlertTriangle className="h-2.5 w-2.5" />
              ) : (
                <Clock className="h-2.5 w-2.5" />
              )}
              {overdue ? `Overdue · ${shortDate(task.dueDate)}` : dueToday ? `Today · ${shortDate(task.dueDate)}` : shortDate(task.dueDate)}
            </span>
          )}

          {/* Priority badge */}
          <Badge className={cn("text-[10px] px-1.5 py-0.2", PRIORITY_STYLES[task.priority])}>
            {task.priority}
          </Badge>

          {/* Status badge */}
          <Badge className={cn("text-[10px] px-1.5 py-0.2", TASK_STATUS_STYLES[task.status])}>
            {task.status}
          </Badge>

          {/* Linked lead chip */}
          {task.relatedLead && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.2 text-[10px] font-medium text-slate-300">
              <Building2 className="h-2.5 w-2.5" />
              {task.relatedLead.name}
            </span>
          )}
        </div>
      </div>

      {/* Row actions */}
      <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
        <Dropdown
          trigger={
            <button className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 cursor-pointer">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          }
        >
          <DropdownItem onClick={() => onEdit(task)}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </DropdownItem>
          <DropdownItem danger onClick={() => onDelete(task)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </DropdownItem>
        </Dropdown>
      </div>
    </div>
  );
}

// ─── Group section header (module-level) ──────────────────────────────────────
function GroupHeader({ label, count, labelClass, countClass }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-800/40 px-4 py-2">
      <span className={cn("text-[11px] font-semibold uppercase tracking-wider", labelClass)}>
        {label}
      </span>
      <span className={cn("rounded px-1.5 py-0.2 text-[10px] font-semibold tabular-nums", countClass)}>
        {count}
      </span>
    </div>
  );
}

// ─── Completion progress bar card (module-level) ──────────────────────────────
function ProgressCard({ completed, total }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Card className="px-4 py-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-200">
          <span className="font-semibold text-slate-50 tabular-nums">{completed}</span> of{" "}
          <span className="font-semibold text-slate-50 tabular-nums">{total}</span> tasks completed
        </span>
        <span className="text-xs font-bold text-slate-50 tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-slate-900 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Tasks() {
  // Raw data
  const [tasks, setTasks] = useState(null);
  const [leads, setLeads] = useState([]);

  // UI state
  const [tab, setTab] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Data loading ─────────────────────────────────────────────────────────
  const load = () => {
    setTasks(null);
    tasksApi.list().then((res) => setTasks(res.tasks)).catch(() => setTasks([]));
  };

  useEffect(() => {
    load();
    leadsApi.list().then((res) => setLeads(res.leads)).catch(() => {});
  }, []);

  // ── KPI counts ───────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!tasks) return { total: 0, pending: 0, overdue: 0, completed: 0 };
    return {
      total:     tasks.length,
      pending:   tasks.filter((t) => t.status === "Pending").length,
      overdue:   tasks.filter(isOverdue).length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    };
  }, [tasks]);

  // ── Tab-filtered list ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!tasks) return [];
    if (tab === "all") return tasks;
    return tasks.filter((t) => t.status === tab);
  }, [tasks, tab]);

  // ── Group the filtered tasks into timeline buckets ────────────────────────
  const groupedSections = useMemo(() => {
    // Build a map: groupKey → [tasks]
    const map = {};
    GROUPS.forEach((g) => (map[g.key] = []));
    filtered.forEach((t) => {
      const key = groupKey(t);
      map[key].push(t);
    });
    // Return only non-empty groups in display order
    return GROUPS.filter((g) => map[g.key].length > 0).map((g) => ({
      ...g,
      tasks: map[g.key],
    }));
  }, [filtered]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setFormOpen(true);
  };

  /** Toggle task: Completed ↔ Pending (In Progress tasks also toggle to Completed). */
  const handleToggle = async (task) => {
    const next = task.status === "Completed" ? "Pending" : "Completed";
    try {
      await tasksApi.update(task._id, { status: next });
      load();
    } catch (err) {
      toast.error(err?.message ?? "Could not update task");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await tasksApi.remove(toDelete._id);
      toast.success("Task deleted");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err?.message ?? "Could not delete task");
    } finally {
      setDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <PageHeader title="Follow-ups" subtitle="Stay on top of every commitment.">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> Add task
        </Button>
      </PageHeader>

      {/* KPI stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total tasks"  value={stats.total}     icon={CalendarCheck} />
        <StatCard label="Pending"      value={stats.pending}   icon={Circle} />
        <StatCard label="Overdue"      value={stats.overdue}   icon={AlertTriangle} />
        <StatCard label="Completed"    value={stats.completed} icon={CheckCircle2} accent />
      </div>

      {/* Completion progress bar */}
      {tasks !== null && (
        <ProgressCard completed={stats.completed} total={stats.total} />
      )}

      {/* Status filter tabs + grouped task list */}
      <Card className="overflow-hidden">
        {/* Tabs toolbar */}
        <div className="border-b border-slate-800 px-5 py-3">
          <Tabs value={tab} onChange={setTab} tabs={STATUS_TABS} />
        </div>

        {/* Body */}
        {tasks === null ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No tasks here"
            description={
              tab === "all"
                ? "Add your first follow-up to get started."
                : `No tasks with status "${tab}".`
            }
            action={
              tab === "all" ? (
                <Button onClick={openNew}>
                  <Plus className="h-4 w-4" /> Add task
                </Button>
              ) : null
            }
          />
        ) : (
          <div>
            {groupedSections.map((group) => (
              <div key={group.key}>
                <GroupHeader
                  label={group.label}
                  count={group.tasks.length}
                  labelClass={group.labelClass}
                  countClass={group.countClass}
                />
                <div className="divide-y divide-line">
                  {group.tasks.map((task) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      onToggle={handleToggle}
                      onEdit={openEdit}
                      onDelete={setToDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add / Edit dialog */}
      <TaskFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        task={editing}
        leads={leads}
        onSaved={load}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete this task?"
        description={`"${toDelete?.title}" will be permanently removed.`}
        confirmLabel="Delete task"
      />
    </div>
  );
}
