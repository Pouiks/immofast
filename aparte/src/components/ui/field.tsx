import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-field border border-[#e4e3ea] bg-surface px-3 py-[11px] text-[13.5px] font-semibold text-ink outline-none focus:border-accent disabled:bg-app disabled:text-[#8a8a9a]";

/** Groupe label + champ, en colonne (motif répété partout dans les formulaires). */
export function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-bold text-muted">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
      {hint != null && <span className="text-[11px] font-semibold text-ghost">{hint}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, "resize-y font-medium", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(fieldBase, "cursor-pointer", className)} {...props} />
  ),
);
Select.displayName = "Select";
