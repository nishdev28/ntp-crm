import { cn } from "../../lib/utils";

/**
 * Clean icon button component for toolbars, modals, and card controls.
 */
export function IconButton({ className, variant = "outline", children, ...props }) {
  const variants = {
    outline:
      "border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/5",
    ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    solid: "bg-teal-400 text-slate-950 hover:bg-teal-300",
    muted: "bg-white/[0.06] text-slate-300 hover:text-white hover:bg-white/10",
  };
  return (
    <button
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/30",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
