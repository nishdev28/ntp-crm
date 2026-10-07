import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const baseField =
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-teal-400/50 focus:outline-none focus:ring-2 focus:ring-teal-400/15 disabled:opacity-50";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(baseField, "h-9", className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea(
  { className, rows = 4, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseField, "py-2 resize-none leading-relaxed", className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(baseField, "h-9 appearance-none bg-no-repeat pr-8 cursor-pointer", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.65rem center",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn("block text-xs font-medium text-slate-300 mb-1.5", className)}
      {...props}
    >
      {children}
    </label>
  );
}

/** Field wrapper that renders a label + optional error message. */
export function Field({ label, error, children, className }) {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      {children}
      {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}
    </div>
  );
}
