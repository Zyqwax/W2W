import Skeleton from "@/components/ui/Skeleton";

export default function PageLoading({ label = "Yükleniyor" }: { label?: string }) {
  return (
    <main className="min-h-dvh bg-bg px-4 pb-24 pt-8 text-text md:px-8" role="status" aria-label={label}>
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton width="8rem" height="0.8rem" rounded="sm" />
        <Skeleton width="min(100%, 22rem)" height="2.5rem" rounded="md" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} width="100%" height="13rem" rounded="md" />)}
        </div>
      </div>
    </main>
  );
}
