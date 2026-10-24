"use client";

import type { HTMLAttributes } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  full: "rounded-full",
};

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  width?: string | number;
  height?: string | number;
  rounded?: keyof typeof radiusClasses;
  className?: string;
}

export default function Skeleton({ width = "100%", height = "1rem", rounded = "md", className, ...props }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      style={{ width, height }}
      className={twMerge(clsx("block animate-pulse bg-surface-2", radiusClasses[rounded] || radiusClasses.md, className))}
      {...props}
    />
  );
}
