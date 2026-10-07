import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

/* Button variants — precise, engineered, professional SaaS aesthetic */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-teal-400 text-slate-950 font-semibold hover:bg-teal-300 active:bg-teal-500",
        secondary:
          "bg-white/[0.06] text-slate-100 hover:bg-white/10 border border-white/10",
        outline:
          "border border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
        ghost:
          "text-slate-400 hover:bg-white/5 hover:text-slate-100",
        danger:
          "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30",
        subtle:
          "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white",
      },
      size: {
        sm: "h-8 px-2.5 text-xs font-medium",
        md: "h-9 px-3.5 text-sm",
        lg: "h-10 px-4 text-sm font-medium",
        icon: "h-9 w-9 p-0",
        "icon-sm": "h-8 w-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export { buttonVariants };
