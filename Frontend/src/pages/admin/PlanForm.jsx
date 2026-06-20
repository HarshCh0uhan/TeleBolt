import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";

const OPERATORS = ["Jio", "Airtel", "VI"];
const CATEGORIES = ["Daily", "Non-Daily"];
const OTT_APPS = ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5", "Other"];

const emptyForm = {
  operator: "",
  category: "",
  price: "",
  validityDays: "",
  dailyData: "",
  totalData: "",
  sms: "",
  isUnlimitedCalls: true,
  isUnlimitedSMS: false,
  ottApps: [],
  isActive: true,
};

// Renders for both /admin/plans/create and /admin/plans/:id/edit.
// `isEditMode` is inferred from the presence of an :id param.
const PlanForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // TODO: if isEditMode, fetch the existing plan on mount and setForm(data.plan)
  // useEffect(() => { if (isEditMode) { ... } }, [id])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleOttApp = (app) => {
    const updated = form.ottApps.includes(app)
      ? form.ottApps.filter((o) => o !== app)
      : [...form.ottApps, app];
    update("ottApps", updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: validate (mirror schema rules — e.g. either dailyData or
    // totalData must be present), then call createPlan(form) or
    // updatePlan(id, form), then navigate("/admin/plans") on success.

    setSubmitting(false);
  };

  return (
    <AdminLayout
      title={isEditMode ? "Edit Plan" : "Create Plan"}
      description={
        isEditMode
          ? "Update the details for this plan."
          : "Add a new telecom recharge plan."
      }
    >
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 sm:p-8"
      >
        {/* Operator + Category */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Operator">
            <select
              value={form.operator}
              onChange={(e) => update("operator", e.target.value)}
              className="select"
              required
            >
              <option value="" disabled>
                Select operator
              </option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="select"
              required
            >
              <option value="" disabled>
                Select category
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Price + Validity */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Field label="Price (₹)">
            <input
              type="number"
              min={1}
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="input"
              required
            />
          </Field>

          <Field label="Validity (days)">
            <input
              type="number"
              min={1}
              max={365}
              value={form.validityDays}
              onChange={(e) => update("validityDays", e.target.value)}
              className="input"
              required
            />
          </Field>
        </div>

        {/* Data — daily vs total depends on category */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Field label="Daily Data (GB)" hint="Required for Daily plans">
            <input
              type="number"
              step="0.5"
              value={form.dailyData}
              onChange={(e) => update("dailyData", e.target.value)}
              className="input"
              disabled={form.category === "Non-Daily"}
            />
          </Field>

          <Field label="Total Data (GB)" hint="Required for Non-Daily plans">
            <input
              type="number"
              value={form.totalData}
              onChange={(e) => update("totalData", e.target.value)}
              className="input"
              disabled={form.category === "Daily"}
            />
          </Field>
        </div>

        {/* SMS */}
        <div className="mt-6">
          <Field label="SMS (per validity period)">
            <input
              type="number"
              value={form.sms}
              onChange={(e) => update("sms", e.target.value)}
              className="input max-w-xs"
            />
          </Field>
        </div>

        {/* Toggles */}
        <div className="mt-6 flex flex-wrap gap-6">
          <Toggle
            label="Unlimited calls"
            checked={form.isUnlimitedCalls}
            onChange={(v) => update("isUnlimitedCalls", v)}
          />
          <Toggle
            label="Unlimited SMS"
            checked={form.isUnlimitedSMS}
            onChange={(v) => update("isUnlimitedSMS", v)}
          />
          <Toggle
            label="Active"
            checked={form.isActive}
            onChange={(v) => update("isActive", v)}
          />
        </div>

        {/* OTT Apps */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            OTT Apps
          </p>
          <div className="flex flex-wrap gap-2">
            {OTT_APPS.map((app) => {
              const selected = form.ottApps.includes(app);
              return (
                <button
                  type="button"
                  key={app}
                  onClick={() => toggleOttApp(app)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selected
                      ? "border-[#58c28d]/40 bg-[#58c28d]/10 text-[#58c28d]"
                      : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {app}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex gap-3 border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/plans")}
            className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:text-white sm:flex-none sm:px-8"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-[#58c28d] py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50 sm:flex-none sm:px-8"
          >
            {submitting
              ? "Saving…"
              : isEditMode
              ? "Save changes"
              : "Create plan"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

// Small layout helper — label + control + optional hint.
const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
      {label}
    </span>
    {children}
    {hint && <span className="mt-1.5 block text-xs text-zinc-500">{hint}</span>}
  </label>
);

const Toggle = ({ label, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-3">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-[#58c28d]" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
    <span className="text-sm text-zinc-300">{label}</span>
  </label>
);

export default PlanForm;

/* Shared input styles — add once to your global CSS (e.g. index.css):

.input, .select {
  @apply w-full rounded-xl border border-white/10 bg-[#181818] px-4 py-2.5
         text-sm text-white focus:border-[#58c28d]/50 focus:outline-none
         disabled:cursor-not-allowed disabled:opacity-40;
}
*/