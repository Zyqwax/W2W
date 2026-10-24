import ListCard from "@/components/pages/lists/ListCard";

export default function ListGrid({ lists, listMovies = {}, t, editingId, editingName, onEditStart, onEditingNameChange, onSave, onVisibilityChange, onDelete, newListButton }) {
  const featuredList = lists.find((list) => list.id === "wishlist") || lists[0];
  const remainingLists = lists.filter((list) => list.id !== featuredList?.id);
  const renderCard = (list, featured = false) => (
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
      featured={featured}
    />
  );

  return (
    <div className="space-y-3">
      {featuredList && renderCard(featuredList, true)}
      {remainingLists.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{remainingLists.map((list) => renderCard(list))}</div>}
      <div className="grid sm:grid-cols-2">{newListButton}</div>
    </div>
  );
}
