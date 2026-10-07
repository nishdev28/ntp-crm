import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Accessible modal dialog rendered through a portal.
 */
export function Dialog({ open, onClose, title, description, children, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/75 transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-panel text-slate-100 shadow-2xl shadow-black/60 animate-fade-up max-h-[90vh] overflow-y-auto no-scrollbar",
          className
        )}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-white/[0.07]">
            <div>
              {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
              {description && (
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white rounded-md p-1 hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Right-side slide-over drawer for record details.
 */
export function Drawer({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-panel text-slate-100 shadow-2xl shadow-black/60 overflow-y-auto no-scrollbar",
          className
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-panel/95 backdrop-blur px-5 py-3.5 border-b border-white/[0.07]">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-md p-1 hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
