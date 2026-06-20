import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Search } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import Badge from "../../components/admin/Badge";

const operatorTone = { Jio: "mint", Airtel: "yellow", VI: "zinc" };

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: fetch all plans (admin view — include inactive too)
    // const { data } = await getAdminPlans()
    // setPlans(data.plans)
  }, []);

  // TODO: swap for server-side search once admin.api supports a query param
  const filteredPlans = plans.filter((p) =>
    p.operator.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (planId) => {
    // TODO: confirm + call deletePlan(planId), then remove from state
  };

  const handleToggleActive = (planId, nextValue) => {
    // TODO: call updatePlan(planId, { isActive: nextValue }), then update state
  };

  return (
    <AdminLayout
      title="Manage Plans"
      description={`${plans.length} plan${plans.length === 1 ? "" : "s"} total`}
      actions={
        <Link
          to="/admin/plans/create"
          className="rounded-xl bg-[#58c28d] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110"
        >
          New Plan
        </Link>
      }
    >
      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by operator…"
          className="w-full rounded-xl border border-white/10 bg-[#1f1f1f] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-[#58c28d]/50 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4 font-medium">Operator</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Validity</th>
              <th className="px-6 py-4 font-medium">Data</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlans.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                  No plans match your search.
                </td>
              </tr>
            ) : (
              filteredPlans.map((plan) => (
                <tr
                  key={plan._id}
                  className="border-b border-white/5 text-zinc-300 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <Badge tone={operatorTone[plan.operator] ?? "zinc"}>
                      {plan.operator}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{plan.category}</td>
                  <td className="px-6 py-4 font-medium text-white">
                    ₹{plan.price}
                  </td>
                  <td className="px-6 py-4">{plan.validityDays} days</td>
                  <td className="px-6 py-4">
                    {plan.category === "Daily"
                      ? `${plan.dailyData} GB/day`
                      : `${plan.totalData} GB`}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleActive(plan._id, !plan.isActive)}>
                      <Badge tone={plan.isActive ? "mint" : "red"}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/plans/${plan._id}/edit`}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-400/10 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ManagePlans;