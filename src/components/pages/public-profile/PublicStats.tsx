export default function PublicStats({
  ownerName,
  lists = [],
  listMovies = {},
  t,
}: {
  ownerName?: string;
  lists?: any[];
  listMovies?: Record<string, any[]>;
  t: (key: string, values?: Record<string, any>) => string;
}) {
  const publicLists = lists.filter((list) => list.visibility === "public");
  const totalMovies = publicLists.reduce((total, list) => total + (listMovies[list.id]?.length || 0), 0);
  const wishlistCount = listMovies.wishlist?.length || 0;
  const stats = [
    { value: publicLists.length, label: "Herkese açık liste" },
    { value: totalMovies, label: t("common.film") },
    { value: wishlistCount, label: `${ownerName || "User"}'s Wishlist` },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl border-b border-border px-4 py-6 sm:px-6 md:px-8" aria-label="Public profile statistics">
      <div className="grid grid-cols-3 divide-x divide-border">
        {stats.map((stat) => (
          <div key={stat.label} className="min-w-0 px-2 text-center sm:px-4">
            <p className="font-syne text-3xl font-bold leading-none text-accent sm:text-4xl">{stat.value}</p>
            <p className="mt-2 truncate text-xs text-muted sm:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
