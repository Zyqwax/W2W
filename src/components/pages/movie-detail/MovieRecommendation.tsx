import RecommendModal from "@/components/RecommendModal";

export default function MovieRecommendation({ open, friends, movieTitle, onClose, onSelect, t }) {
  if (!open) return null;
  return <RecommendModal friends={friends} movieTitle={movieTitle} onClose={onClose} onSelect={onSelect} t={t} />;
}
