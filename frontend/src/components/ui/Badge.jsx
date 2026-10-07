import { cn } from "../../lib/utils";

/** Small status badge. Clean rectangular badge with subtle rounded corners. */
export function Badge({ className, dot, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-white/10",
        "bg-white/[0.04] text-slate-300",
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />}
      {children}
    </span>
  );
}
