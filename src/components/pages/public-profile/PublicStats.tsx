export default function PublicStats({
  lists = [],
  listMovies = {},
  t,
}: {
  lists?: any[];
  listMovies?: Record<string, any[]>;
  t: (key: string, values?: Record<string, any>) => string;
}) {
  const publicLists = lists.filter((list) => list.visibility === "public");
  const totalMovies = publicLists.reduce((total, list) => total + (listMovies[list.id]?.length || 0), 0);
  const watchedCount = lists.some((list) => list.id === "watched") ? (listMovies.watched?.length || 0) : "—";
  const stats = [
    { value: publicLists.length, label: t("publicProfile.publicLists") },
    { value: totalMovies, label: t("common.film") },
    { value: watchedCount, label: t("publicProfile.watched") },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:px-8" aria-label={t("publicProfile.statistics")}>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 rounded-2xl border border-border bg-surface px-2 py-4 text-center sm:px-4 sm:py-5">
            <p className="font-syne text-2xl font-bold leading-none text-accent sm:text-4xl">{stat.value}</p>
            <p className="mt-2 truncate text-[11px] text-muted sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
