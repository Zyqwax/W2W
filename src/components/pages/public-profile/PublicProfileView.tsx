import Link from "next/link";
import { Film } from "lucide-react";
import PublicProfileHeader from "@/components/pages/public-profile/PublicProfileHeader";
import PublicStats from "@/components/pages/public-profile/PublicStats";
import PublicListGrid from "@/components/pages/public-profile/PublicListGrid";
import PageLoading from "@/components/ui/PageLoading";

export function PublicProfileLoading() {
  return <PageLoading label="Profil yükleniyor" />;
}

export function PublicProfileNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center text-text">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-border bg-surface">
        <Film size={24} className="text-accent" aria-hidden="true" />
      </div>
      <h1 className="font-syne text-xl font-bold">Kullanıcı bulunamadı</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Bu profile ulaşılamıyor. Profil linki yanlış veya hesap silinmiş olabilir.
      </p>
      <Link
        href="/search"
        className="mt-6 inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:border-accent/60 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Keşfet&apos;e dön
      </Link>
    </main>
  );
}

export default function PublicProfileView({
  targetUser,
  isFriend,
  targetUid,
  ownerName,
  publicLists,
  publicListMovies,
  copyingListId,
  copyStatus,
  onBack,
  onToggleFriend,
  onCopyList,
  onStartChat,
  t,
}) {
  return (
    <main className="min-h-full overflow-hidden bg-bg pb-24 text-text">
      <PublicProfileHeader
        targetUser={targetUser}
        isFriend={isFriend}
        onBack={onBack}
        onToggleFriend={onToggleFriend}
        onStartChat={onStartChat}
        t={t}
      />
      <PublicStats ownerName={targetUser.displayName} lists={publicLists} listMovies={publicListMovies} t={t} />
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:px-8">
        <PublicListGrid
          targetUid={targetUid}
          ownerName={ownerName}
          publicLists={publicLists}
          publicListMovies={publicListMovies}
          onCopyList={onCopyList}
          copyingListId={copyingListId}
          copyStatus={copyStatus}
          t={t}
        />
      </section>
    </main>
  );
}
