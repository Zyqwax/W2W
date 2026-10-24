"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  count: number;
  href?: string;
  viewAllLabel?: string;
  extra?: ReactNode;
}

export default function SectionHeader({ title, count, href, viewAllLabel = "Tümünü Gör", extra }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex min-h-11 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate font-syne text-lg font-semibold text-text">{title}</h2>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">{count}</span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {extra}
        {href && <Link href={href} className="min-h-11 inline-flex items-center text-sm font-semibold text-accent no-underline transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{viewAllLabel}</Link>}
      </div>
    </div>
  );
}
