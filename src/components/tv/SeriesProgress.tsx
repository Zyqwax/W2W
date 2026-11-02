import type { TvProgress } from "@/lib/tv";
export default function SeriesProgress({
  progress,
  tr,
}: {
  progress: TvProgress;
  tr: boolean;
}) {
  const percent = progress.total
    ? Math.round((progress.watched / progress.total) * 100)
    : 0;
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted">
          {progress.watched} / {progress.total}{" "}
          {tr ? "yayınlanmış bölüm" : "aired episodes"}
        </span>
        <span className="font-bold text-accent">%{percent}</span>
      </div>
      <div
        role="progressbar"
        aria-label={tr ? "İzleme ilerlemesi" : "Watch progress"}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-surface-2"
      >
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
