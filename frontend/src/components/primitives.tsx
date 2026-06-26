"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#F77418] font-mono mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-zinc-950">
          {title}
        </h1>
        {subtitle && <p className="text-zinc-500 mt-2 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg",
        accent ? "border-[#F77418]/20 bg-[#FFF6EE]" : "border-zinc-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-mono">{label}</div>
          <div
  className={cn(
    "font-display font-black text-3xl sm:text-4xl mt-2 tracking-tight",
    accent ? "text-black" : "text-zinc-950"
  )}
>
            {value}
          </div>
          {hint && <div className="text-xs text-zinc-500 mt-2">{hint}</div>}
        </div>
        {Icon && (
          <div
            className={cn(
              "w-10 h-10 rounded-md flex items-center justify-center",
              accent ? "bg-[#F77418] text-black" : "bg-zinc-100 text-zinc-700"
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={2.2} />
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-zinc-200 rounded-xl p-10 text-center bg-zinc-50/50">
      {Icon && (
        <div className="w-12 h-12 rounded-md mx-auto bg-white border border-zinc-200 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-zinc-500" />
        </div>
      )}
      <div className="font-display font-bold text-lg text-zinc-900">{title}</div>
      {description && (
        <div className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">{description}</div>
      )}
      {action && <div className="mt-5 inline-block">{action}</div>}
    </div>
  );
}

const PILL_STYLES: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-zinc-100 text-zinc-600 border-zinc-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  normal: "bg-zinc-100 text-zinc-700 border-zinc-200",
  low: "bg-zinc-50 text-zinc-500 border-zinc-200",
  update: "bg-zinc-100 text-zinc-700 border-zinc-200",
  report: "bg-violet-50 text-violet-700 border-violet-200",
  announcement: "bg-orange-50 text-orange-700 border-orange-200",
};

export function Pill({ status }: { status?: string }) {
  const key = (status || "").toLowerCase();
  const cls = PILL_STYLES[key] || PILL_STYLES.normal;
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
        cls
      )}
    >
      {status}
    </span>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const PrimaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-[#F77418] hover:bg-[#ff8a3d] text-black font-semibold rounded-md px-4 py-2.5 text-sm transition disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  )
);
PrimaryButton.displayName = "PrimaryButton";

export const GhostButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => (
    <button
      ref={ref}
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 text-zinc-900 font-semibold rounded-md px-4 py-2.5 text-sm transition",
        className
      )}
    >
      {children}
    </button>
  )
);
GhostButton.displayName = "GhostButton";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={cn(
        "w-full bg-white border border-zinc-300 focus:border-[#F77418] focus:ring-2 focus:ring-[#F77418]/20 outline-none rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition",
        className
      )}
    />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    {...props}
    className={cn(
      "w-full bg-white border border-zinc-300 focus:border-[#F77418] focus:ring-2 focus:ring-[#F77418]/20 outline-none rounded-md px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition",
      className
    )}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    {...props}
    className={cn(
      "w-full bg-white border border-zinc-300 focus:border-[#F77418] focus:ring-2 focus:ring-[#F77418]/20 outline-none rounded-md px-3 py-2.5 text-sm text-zinc-900 transition",
      className
    )}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Modalup({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {

   useEffect(() => {
    if (!open) return;

    // Lock background scroll while the modal is open
    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // Close on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes: Record<string, string> = {
    sm: "max-w-md",
    md: "max-w-3xl",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto",
          sizes[size]
        )}
        data-testid="modal"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
          <div className="font-display font-bold text-xl text-zinc-900">{title}</div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 text-xl leading-none"
            data-testid="modal-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;

    // Lock background scroll while the modal is open
    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    // Close on Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes: Record<string, string> = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto",
          sizes[size]
        )}
        data-testid="modal"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
          <div className="font-display font-bold text-xl text-zinc-900">{title}</div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-900 text-xl leading-none"
            data-testid="modal-close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#F77418] rounded-full animate-spin-slow" />
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white/10 border-t-[#F77418] rounded-full animate-spin-slow" />
    </div>
  );
}
