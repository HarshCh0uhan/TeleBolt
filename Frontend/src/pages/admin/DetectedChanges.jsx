import { useEffect, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Badge from "../../components/admin/Badge";

const statusTone = { Pending: "yellow", Approved: "mint", Rejected: "red" };

const DetectedChanges = () => {
  const [changes, setChanges] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");

  useEffect(() => {
    // TODO: fetch detected changes, optionally filtered by status server-side
    // const { data } = await getDetectedChanges({ status: statusFilter })
    // setChanges(data.changes)
  }, [statusFilter]);

  const handleDecision = (changeId, decision) => {
    // TODO: call updateDetectedChangeStatus(changeId, decision)
    // On "Approved", backend should also apply newValue to the linked Plan.
    // Then remove/update the item in local state.
  };

  return (
    <AdminLayout
      title="Detected Changes"
      description="Review scraped price and validity changes before they go live."
    >
      {/* Status filter tabs */}
      <div className="mb-6 flex gap-2">
        {["Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              statusFilter === status
                ? "bg-[#58c28d]/10 text-[#58c28d]"
                : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {changes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#1f1f1f] py-16 text-center">
          <p className="text-zinc-400">No {statusFilter.toLowerCase()} changes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {changes.map((change) => (
            <div
              key={change._id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  {/* TODO: plan.operator / plan.category come from populated planId */}
                  <p className="font-medium text-white">
                    {change.plan?.operator} · {change.plan?.category}
                  </p>
                  <Badge tone={statusTone[change.status]}>{change.status}</Badge>
                </div>

                <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">
                  {change.field}
                </p>

                <div className="mt-3 flex items-center gap-3 text-lg">
                  <span className="text-zinc-500 line-through">
                    {change.oldValue}
                  </span>
                  <ArrowRight size={16} className="text-zinc-600" />
                  <span className="font-semibold text-[#58c28d]">
                    {change.newValue}
                  </span>
                </div>
              </div>

              {change.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision(change._id, "Rejected")}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:border-red-400/30 hover:text-red-400"
                  >
                    <X size={15} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecision(change._id, "Approved")}
                    className="flex items-center gap-1.5 rounded-xl bg-[#58c28d] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
                  >
                    <Check size={15} />
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default DetectedChanges;