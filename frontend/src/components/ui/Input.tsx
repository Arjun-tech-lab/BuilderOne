"use client";

import { cn } from "@/lib/format";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export const Label = ({
  children,
  htmlFor,
  className,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}) => (
  <label
    htmlFor={htmlFor}
    className={cn("mb-1.5 block text-sm font-medium text-ink-800", className)}
  >
    {children}
  </label>
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "min-h-12 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-base text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:min-h-11 sm:text-sm",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-base text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 sm:text-sm",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-red-600">{message}</p>;
}

export function SelectChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full border px-3.5 py-2.5 text-sm transition active:scale-[0.98] sm:min-h-10 sm:px-4 sm:py-2",
        selected
          ? "border-brand-600 bg-brand-50 text-brand-800"
          : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"
      )}
    >
      {children}
    </button>
  );
}
