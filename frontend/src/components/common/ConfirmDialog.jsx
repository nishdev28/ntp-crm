import { AlertTriangle } from "lucide-react";
import { Dialog, Button } from "../ui";

/** Reusable confirmation modal for destructive actions. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="mt-3.5 text-base font-semibold text-white">{title}</h3>
        {description && (
          <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">{description}</p>
        )}
        <div className="mt-6 flex w-full gap-2.5">
          <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
