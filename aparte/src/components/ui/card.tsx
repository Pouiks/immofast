import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Surface blanche arrondie standard (carte). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-black/5 bg-surface shadow-card",
        className,
      )}
      {...props}
    />
  );
}
