import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

/* Card primitives — clean, high-contrast, structured containers */

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.07] bg-panel text-slate-100",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex items-start justify-between gap-4 p-5 pb-0", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn("text-sm font-semibold text-white tracking-tight", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-xs text-slate-400 mt-0.5", className)} {...props} />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5", className)} {...props} />;
}

/**
 * Clean card header: title, subtitle, optional leading icon, and optional trailing action.
 */
export function SectionHeading({
  icon: Icon,
  title,
  subtitle,
  to,
  action,
  className,
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 pb-4", className)}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-slate-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action ??
        (to ? (
          <Link
            to={to}
            aria-label="View all"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : null)}
    </div>
  );
}
