"use client";

import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const tones = {
  accent: "bg-accent/15 text-accent",
  muted: "bg-surface-2 text-muted",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  danger: "bg-danger/15 text-danger",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones;
  className?: string;
  children?: ReactNode;
}

export default function Badge({ tone = "accent", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex min-h-6 items-center rounded-full px-2.5 py-1 font-inter text-[11px] font-semibold leading-none",
          tones[tone] || tones.accent,
          className,
        ),
      )}
      {...props}
    >
      {children}
    </span>
  );
}
