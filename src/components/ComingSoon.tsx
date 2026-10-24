"use client";

import Link from "next/link";
import { Film, ArrowLeft } from "lucide-react";
import { DEFAULT_LANGUAGE, translate } from "@/lib/i18n";

export default function ComingSoon() {
  const t = (key: string, values?: Record<string, any>) => translate(DEFAULT_LANGUAGE, key, values);
  return (
    <section className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-bg px-6 py-10 text-center text-text" aria-labelledby="coming-soon-title">
      <div className="relative grid h-20 w-20 place-items-center rounded-[var(--radius-lg)] border border-border bg-surface text-accent">
        <span className="absolute -right-3 -top-3 rounded-full border border-accent/50 bg-surface-2 px-2 py-1 text-[10px] font-semibold text-accent">Yakında</span>
        <Film size={30} />
      </div>
      <p className="mt-5 text-sm font-semibold text-accent">{t("comingSoon.eyebrow")}</p>
      <h1 id="coming-soon-title" className="my-3 max-w-[700px] font-syne text-[clamp(34px,6vw,60px)] font-bold leading-[0.98] text-text">{t("comingSoon.title")}</h1>
      <p className="mb-6 max-w-[420px] text-sm leading-7 text-muted">{t("comingSoon.description")}</p>
      <Link href="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 py-3 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"><ArrowLeft size={16} /> {t("comingSoon.home")}</Link>
    </section>
  );
}
