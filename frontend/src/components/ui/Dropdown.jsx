import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

/**
 * Clean click-to-open dropdown menu.
 */
export function Dropdown({ trigger, children, align = "right", className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-40 mt-1 min-w-[11rem] rounded-xl border border-white/10 bg-panel-2 p-1 shadow-2xl shadow-black/60 animate-fade-up text-left",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, danger, children, ...props }) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-slate-300 font-medium transition-colors hover:bg-white/[0.06] hover:text-white cursor-pointer",
        danger && "text-rose-400 hover:bg-rose-500/15 hover:text-rose-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownLabel({ children }) {
  return (
    <p className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{children}</p>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-white/[0.07]" />;
}
