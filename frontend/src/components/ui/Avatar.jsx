import { cn } from "../../lib/utils";
import { initials } from "../../lib/utils";

/* Avatar that renders an image when available, otherwise colored initials.
   Color is derived deterministically from the name for a lively, varied look. */
const palette = [
  "bg-teal-500/15 text-teal-300 border border-teal-500/25",
  "bg-sky-500/15 text-sky-300 border border-sky-500/25",
  "bg-lime-500/15 text-lime-300 border border-lime-500/25",
  "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
];

function colorFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ name = "", src, size = "md", className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold overflow-hidden shrink-0",
        sizes[size],
        !src && colorFor(name),
        className
      )}
      title={name}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials(name) || "?"
      )}
    </div>
  );
}
