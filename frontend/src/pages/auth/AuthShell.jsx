import { Hexagon } from "lucide-react";

/* Split auth layout: quiet brand panel on the left, form on the right. */
export function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_0%,rgba(47,184,162,0.14),transparent)]"
        />
        <div className="relative flex items-center gap-2.5">
          <Hexagon className="h-5 w-5 text-teal-300" />
          <span className="text-[15px] font-semibold tracking-tight text-white">NTP CRM</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
            Every deal, contact and follow-up in one place.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Track the pipeline, keep notes next to the people they belong to, and never miss a
            follow-up.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Now To Program
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center border-white/6 px-6 py-12 lg:w-1/2 lg:border-l">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
