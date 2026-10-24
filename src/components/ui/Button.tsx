"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { LoaderCircle } from "lucide-react";
import { twMerge } from "tailwind-merge";

const variants = {
  primary: "bg-accent text-bg hover:brightness-110",
  ghost: "border border-border bg-transparent text-text hover:border-accent/60 hover:bg-accent/10",
  danger: "bg-danger text-bg hover:brightness-110",
};

const sizes = {
  sm: "min-h-11 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-inter font-semibold transition-[background-color,border-color,color,filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          className,
        ),
      )}
      {...props}
    >
      {loading && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
