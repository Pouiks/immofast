"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/** Bascule segmentée (ex. Semaine / Mois de l'agenda). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-[3px] rounded-[11px] border border-[#eceaf0] bg-surface p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-lg px-[18px] py-2 text-[12.5px] font-bold transition",
            value === opt.value ? "bg-accent text-white" : "text-[#8a8a9a]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
