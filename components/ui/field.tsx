"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Form field shell. Errors are tied to the control with aria-describedby and
 * aria-invalid so screen readers announce them — spec § 10.
 */
export function Field({
  label,
  error,
  hint,
  prefix,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  prefix?: string;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    className: string;
  }) => React.ReactNode;
}) {
  const id = useId();
  const messageId = error || hint ? `${id}-msg` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="label-micro">
        {label}
      </label>

      <div className={cn("flex items-stretch", prefix && "gap-0")}>
        {prefix && (
          <span className="border-line text-ink-dim flex items-center rounded-l-[10px] border border-r-0 px-3 font-sans text-sm">
            {prefix}
          </span>
        )}
        {children({
          id,
          "aria-invalid": Boolean(error),
          "aria-describedby": messageId,
          className: cn(
            "bg-bg border-line text-ink placeholder:text-ink-dim/70 w-full border px-3.5 py-3",
            "font-sans text-[15px] transition-colors duration-200",
            "focus:border-gold focus:outline-none",
            "aria-[invalid=true]:border-red-500/70",
            prefix ? "rounded-r-[10px]" : "rounded-[10px]",
          ),
        })}
      </div>

      {(error || hint) && (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn("font-sans text-xs", error ? "text-red-400" : "text-ink-dim")}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
