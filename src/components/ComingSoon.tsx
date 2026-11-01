"use client";

import Link from "next/link";
import { ArrowLeft, Bell, MessageCircle } from "lucide-react";
import { translate } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";

export default function ComingSoon() {
  const { language } = useAuth();
  const t = (key: string, values?: Record<string, any>) => translate(language, key, values);

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-9rem)] max-w-[1480px] items-center justify-center px-4 py-10 text-text sm:px-7 lg:min-h-[calc(100dvh-6rem)] lg:px-10" aria-labelledby="coming-soon-title">
      <div className="w-full max-w-2xl rounded-[28px] border border-border bg-surface p-7 text-center shadow-sm sm:p-12">
        <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/10 text-accent">
          <MessageCircle size={28} aria-hidden="true" />
          <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-surface bg-[#f2e6c8] text-[#76520c]"><Bell size={14} aria-hidden="true" /></span>
        </div>
        <p className="mt-6 text-sm font-bold text-accent">{t("comingSoon.eyebrow")}</p>
        <h1 id="coming-soon-title" className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl">{t("comingSoon.title")}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted">{t("comingSoon.description")}</p>
        <Link href="/" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"><ArrowLeft size={16} />{t("comingSoon.home")}</Link>
      </div>
    </section>
  );
}
