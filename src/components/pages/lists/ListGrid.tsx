import ListCard from "@/components/pages/lists/ListCard";

export default function ListGrid({ lists, listMovies = {}, t, editingId, editingName, onEditStart, onEditingNameChange, onSave, onVisibilityChange, onDelete, newListButton }) {
  const defaultLists = ["wishlist", "watched"].map((id) => lists.find((list) => list.id === id)).filter(Boolean);
  const customLists = lists.filter((list) => list.type === "custom");
  const renderCard = (list) => (
    <ListCard
      key={list.id}
      list={list}
      movies={listMovies[list.id] || list.movies || list.previewMovies || []}
      t={t}
      editingId={editingId}
      editingName={editingName}
      onEditStart={onEditStart}
      onEditingNameChange={onEditingNameChange}
      onSave={onSave}
      onVisibilityChange={onVisibilityChange}
      onDelete={onDelete}
    />
  );

  return (
    <div className="space-y-10">
      <section aria-labelledby="default-lists-heading">
        <header className="mb-4"><h2 id="default-lists-heading" className="text-lg font-extrabold text-text">{t("lists.defaults")}</h2><p className="mt-1 text-sm text-muted">{t("lists.defaultsDescription")}</p></header>
        <div className="grid gap-4 sm:grid-cols-2">{defaultLists.map((list) => renderCard(list))}</div>
      </section>
      <section aria-labelledby="custom-lists-heading">
        <header className="mb-4"><h2 id="custom-lists-heading" className="text-lg font-extrabold text-text">{t("lists.custom")}</h2><p className="mt-1 text-sm text-muted">{t("lists.customDescription")}</p></header>
        <div className="grid gap-4 sm:grid-cols-2">{customLists.map((list) => renderCard(list))}{newListButton}</div>
      </section>
    </div>
  );
}
