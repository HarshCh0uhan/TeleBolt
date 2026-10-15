import { useEffect, useState } from "react";
import { Loader2, Star, Trash2, PencilLine, Check, X } from "lucide-react";
import StarRating from "./StarRating";
import { useAuth } from "../context/AuthContext";
import { getPlanReviews, createReview, updateReview, deleteReview } from "../api/plans.api";
import { getErrorMessage } from "../utils/errors";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const ReviewSection = ({ planId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await getPlanReviews(planId);
      setReviews(data.reviews || []);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load reviews."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId]);

  const myReview = user ? reviews.find((r) => r.user?._id === user._id || r.user === user._id) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!rating) return setFormError("Pick a rating.");

    setSaving(true);
    try {
      await createReview(planId, { rating, comment });
      setRating(0);
      setComment("");
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not submit review."));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment("");
  };

  const handleUpdate = async (reviewId) => {
    setBusyId(reviewId);
    try {
      await updateReview(reviewId, { rating: editRating, comment: editComment });
      cancelEdit();
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not update review."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (reviewId) => {
    setBusyId(reviewId);
    try {
      await deleteReview(reviewId);
      await load();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not delete review."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
      <h2 className="text-xl font-semibold text-white sm:text-2xl">Reviews</h2>
      <p className="mt-2 text-sm text-zinc-400">
        {reviews.length === 0
          ? "No reviews yet. Be the first to share your experience."
          : `${reviews.length} review${reviews.length === 1 ? "" : "s"} from users.`}
      </p>

      {error && (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Write form — logged-in users only, and only if they have not reviewed yet */}
      {user && !myReview && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-white/10 bg-[#262626] p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-300">Your rating</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="p-0.5"
                >
                  <Star
                    className={`h-5 w-5 transition ${
                      n <= rating ? "fill-amber-400 text-amber-400" : "text-zinc-600 hover:text-amber-400"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Share your experience with this plan…"
            className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-[#58c28d]/40"
          />
          <p className="mt-1 text-xs text-zinc-600">{comment.length}/500</p>

          {formError && <p className="mt-2 text-xs text-red-400">{formError}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#58c28d] px-5 py-2.5 text-sm font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit review
          </button>
        </form>
      )}

      {!user && (
        <p className="mt-6 rounded-2xl border border-white/10 bg-[#262626] p-4 text-sm text-zinc-400">
          Log in to write a review.
        </p>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#262626] animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? null : (
        <div className="mt-6 space-y-3">
          {reviews.map((review) => {
            const isMine = user && (review.user?._id === user._id || review.user === user._id);
            const isEditing = editingId === review._id;

            return (
              <div key={review._id} className="rounded-2xl border border-white/10 bg-[#262626] p-4">
                {isEditing ? (
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setEditRating(n)}
                          aria-label={`${n} stars`}
                          className="p-0.5"
                        >
                          <Star
                            className={`h-4 w-4 transition ${
                              n <= editRating ? "fill-amber-400 text-amber-400" : "text-zinc-600 hover:text-amber-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-[#58c28d]/40"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(review._id)}
                        disabled={busyId === review._id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#58c28d] px-3.5 py-2 text-xs font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:opacity-60"
                      >
                        {busyId === review._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#181818] px-3.5 py-2 text-xs text-zinc-300 transition hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {review.user?.username || "User"}
                          </span>
                          <StarRating value={review.rating} />
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-600">{formatDate(review.createdAt)}</p>
                      </div>
                      {isMine && (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEdit(review)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-[#181818] text-zinc-400 transition hover:text-white"
                            aria-label="Edit review"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review._id)}
                            disabled={busyId === review._id}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-[#181818] text-zinc-400 transition hover:border-red-400/30 hover:text-red-400 disabled:opacity-60"
                            aria-label="Delete review"
                          >
                            {busyId === review._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {review.comment && (
                      <p className="mt-3 break-words text-sm leading-6 text-zinc-300">{review.comment}</p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;