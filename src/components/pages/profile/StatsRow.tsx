import Link from "next/link";
import { Eye, Heart, Star } from "lucide-react";

export default function StatsRow({ movies, watchedCount, wishlistCount, average, t }) {
  const stats = [
    { value: watchedCount, label: "profile.watched", icon: Eye, href: "/lists/watched" },
    { value: wishlistCount, label: "profile.wishlist", icon: Heart, href: "/lists/wishlist" },
    { value: average || "—", label: "profile.average", icon: Star },
  ];

  return (
    <section className="mt-5" aria-label="Profile statistics">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const content = <>
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent"><Icon size={17} aria-hidden="true" /></div>
            <p className="font-syne text-2xl font-bold leading-none text-text sm:text-3xl">{movies === undefined ? "—" : stat.value}</p>
            <p className="mt-2 truncate text-[11px] text-muted sm:text-sm">{t(stat.label)}</p>
          </>;
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className="min-w-0 rounded-2xl border border-border bg-surface px-2 py-4 text-center transition hover:border-accent/50 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-4 sm:py-5">{content}</Link>
          ) : (
            <div key={stat.label} className="min-w-0 rounded-2xl border border-border bg-surface px-2 py-4 text-center sm:px-4 sm:py-5">{content}</div>
          );
        })}
      </div>
    </section>
  );
}
