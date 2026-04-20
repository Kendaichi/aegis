import { Loader2 } from "lucide-react";
import AegisLogo from "./AegisLogo";

interface CenteredProps {
  message?: string;
  className?: string;
  logoClassName?: string;
}

/** Full-area loading: centered logo, spinner, and message. */
export function BrandedLoader({
  message = "Loading…",
  className = "",
  logoClassName = "h-20 w-20 object-contain opacity-95 animate-pulse",
}: CenteredProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <AegisLogo className={logoClassName} />
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-aegis-accent" aria-hidden />
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

interface InlineProps {
  message: string;
  className?: string;
}

/** Compact row for cards, tables, and side panels. */
export function BrandedLoaderInline({ message, className = "" }: InlineProps) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-slate-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <AegisLogo className="h-9 w-9 shrink-0 object-contain opacity-90" />
      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-aegis-accent" aria-hidden />
      <span className="text-[13px]">{message}</span>
    </div>
  );
}
