import { ArrowRight, Sparkles, Check, X, Loader2 } from 'lucide-react';
import AdminStatusBadge from './AdminStatusBadge';
import { FIELD_LABELS, SOURCE_LABELS, formatFieldValue } from '../../utils/detectedChangeFormat';

/**
 * One row in the review queue. Renders either a scalar field change
 * ("₹299 → ₹349") or a whole new plan proposed by the sync service.
 */
const DetectedChangeCard = ({ change, onApprove, onReject, busy = false, showStatus = false }) => {
  const isNewPlan = change.field === 'NewPlan';
  const snapshot = change.snapshot || {};

  return (
    <div className="rounded-3xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {isNewPlan ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {snapshot.operator || 'Unknown'} new plan
                </span>
                <span className="text-lg font-bold text-white">₹{snapshot.price}</span>
                <span className="text-sm text-zinc-400">{snapshot.category}</span>
              </>
            ) : (
              <>
                <h3 className="text-base font-medium text-white">
                  {FIELD_LABELS[change.field] || change.field} change
                </h3>
                {showStatus && <AdminStatusBadge status={change.status} />}
              </>
            )}
          </div>

          {isNewPlan ? (
            <p className="mt-2 text-sm text-zinc-400">
              {snapshot.validityDays} days •{' '}
              {snapshot.dailyData ? `${snapshot.dailyData} GB/day` : `${snapshot.totalData} GB total`}
              {snapshot.sms ? ` • ${snapshot.sms} SMS/day` : ''}
              {snapshot.isUnlimitedCalls ? ' • unlimited calls' : ''}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">
              <span className="text-white line-through decoration-zinc-600">
                {formatFieldValue(change.field, change.oldValue)}
              </span>
              <ArrowRight className="mx-1 inline h-3 w-3 text-[#58c28d]" />
              <span className="font-medium text-[#58c28d]">
                {formatFieldValue(change.field, change.newValue)}
              </span>
            </p>
          )}

          <p className="mt-1 text-xs text-zinc-500">
            {SOURCE_LABELS[change.source] || change.source} • detected{' '}
            {new Date(change.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onApprove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2 text-xs font-semibold text-[#181818] transition hover:bg-[#6dd9a0] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            {isNewPlan ? 'Add to catalogue' : 'Approve'}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#181818] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:border-red-400/30 hover:text-red-400 disabled:opacity-60"
          >
            <X className="h-3.5 w-3.5" />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetectedChangeCard;
