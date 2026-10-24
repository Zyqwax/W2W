export default function StatsRow({ movies, watchedCount, wishlistCount, average, t }) {
  const stats = [
    { value: watchedCount, label: "profile.watched" },
    { value: wishlistCount, label: "profile.wishlist" },
    { value: average || "—", label: "profile.average" },
  ];

  return (
    <section className="border-b border-border py-6" aria-label="Profile statistics">
      <div className="grid grid-cols-3 divide-x divide-border">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 px-2 text-center sm:px-4">
            <p className="font-syne text-3xl font-bold leading-none text-accent sm:text-4xl">
              {movies === undefined ? "—" : stat.value}
            </p>
            <p className="mt-2 truncate text-xs text-muted sm:text-sm">{t(stat.label)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
