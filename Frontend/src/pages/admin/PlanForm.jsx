import { useEffect, useState } from 'react';
import { ChevronRight, CircleDot, Loader2, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { createPlan, updatePlan } from '../../api/admin.api';
import { getSinglePlan } from '../../api/plans.api';
import { getErrorMessage } from '../../utils/errors';

const OTT_OPTIONS = ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5", "Other"];
const OPERATORS = ["Jio", "Airtel", "VI", "BSNL"];
const CATEGORIES = ["Daily", "Non-Daily"];

const EMPTY_FORM = {
  operator: 'Jio',
  category: 'Daily',
  price: '',
  validityDays: '',
  dailyData: '',
  totalData: '',
  sms: '',
};

const fieldClass =
  "w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40";

const Field = ({ label, hint, children }) => (
  <label className="block">
    <div className="mb-2 text-sm font-medium text-zinc-300">{label}</div>
    {children}
    {hint ? <p className="mt-1.5 text-xs text-zinc-500">{hint}</p> : null}
  </label>
);

const toNumber = (value) => (value === '' || value === null || value === undefined ? null : Number(value));

const Toggle = ({ label, on, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 ${
      on ? 'border-[#58c28d]/40 bg-[#58c28d]/10 text-white' : 'border-white/10 bg-[#181818] text-zinc-300'
    }`}
  >
    <span>{label}</span>
    <span className="rounded-full border border-[#58c28d]/20 bg-[#58c28d]/10 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-[#dff6ea]">
      {on ? 'ON' : 'OFF'}
    </span>
  </button>
);

const PlanForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedOtt, setSelectedOtt] = useState([]);
  const [active, setActive] = useState(true);
  const [isUnlimitedCalls, setIsUnlimitedCalls] = useState(true);
  const [isUnlimitedSMS, setIsUnlimitedSMS] = useState(false);

  const [loadingPlan, setLoadingPlan] = useState(isEdit);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;
    getSinglePlan(id)
      .then(({ data }) => {
        if (cancelled) return;
        const plan = data.plan;
        setForm({
          operator: plan.operator,
          category: plan.category,
          price: plan.price != null ? String(plan.price) : '',
          validityDays: plan.validityDays != null ? String(plan.validityDays) : '',
          dailyData: plan.dailyData != null ? String(plan.dailyData) : '',
          totalData: plan.totalData != null ? String(plan.totalData) : '',
          sms: plan.sms != null ? String(plan.sms) : '',
        });
        setSelectedOtt(plan.ottApps || []);
        setActive(plan.isActive !== false);
        setIsUnlimitedCalls(plan.isUnlimitedCalls !== false);
        setIsUnlimitedSMS(plan.isUnlimitedSMS === true);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadFailed(true);
        setError(getErrorMessage(err, 'Could not load this plan.'));
      })
      .finally(() => {
        if (!cancelled) setLoadingPlan(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const setField = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }));

  const toggleOtt = (item) => {
    setSelectedOtt((current) =>
      current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const price = toNumber(form.price);
    const validityDays = toNumber(form.validityDays);
    const dailyData = toNumber(form.dailyData);
    const totalData = toNumber(form.totalData);
    const sms = toNumber(form.sms);

    if (!(price >= 1)) return setError('Price must be at least 1.');
    if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365)
      return setError('Validity must be a whole number from 1 to 365 days.');
    if (!(dailyData > 0) && !(totalData > 0)) return setError('Enter daily data or total data.');
    if (form.category === 'Daily' && !(dailyData > 0))
      return setError('A Daily plan needs a daily data value.');

    const payload = {
      operator: form.operator,
      category: form.category,
      price,
      validityDays,
      isUnlimitedCalls,
      isUnlimitedSMS,
      ottApps: selectedOtt,
      isActive: active,
    };

    if (isEdit) {
      payload.dailyData = dailyData > 0 ? dailyData : null;
      payload.totalData = totalData > 0 ? totalData : null;
      payload.sms = sms > 0 ? sms : null;
    } else {
      if (dailyData > 0) payload.dailyData = dailyData;
      if (totalData > 0) payload.totalData = totalData;
      if (sms > 0) payload.sms = sms;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updatePlan(id, payload);
        navigate('/admin/plans', { state: { updated: true } });
      } else {
        await createPlan(payload);
        navigate('/admin/plans', { state: { created: true } });
      }
    } catch (err) {
      setError(getErrorMessage(err, isEdit ? 'Failed to update plan. Please try again.' : 'Failed to create plan. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  if (loadingPlan) {
    return (
      <>
        <AdminPageHeader eyebrow="Admin Dashboard" title="Edit plan" description="Loading plan details…" />
        <div className="h-64 animate-pulse rounded-3xl bg-[#262626]" />
      </>
    );
  }

  if (loadFailed) {
    return (
      <>
        <AdminPageHeader eyebrow="Admin Dashboard" title="Edit plan" description="This plan could not be loaded." />
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-6 text-sm text-red-400">
          <p className="break-words">{error}</p>
          <Link
            to="/admin/plans"
            className="mt-4 inline-flex rounded-xl border border-white/10 bg-[#262626] px-4 py-2 text-xs text-zinc-300 transition hover:text-white"
          >
            Back to plans
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title={isEdit ? 'Edit plan' : 'Add plan'}
        description={
          isEdit
            ? 'Update this plan. Changes go live on the public catalogue immediately.'
            : 'Add a new plan to the catalogue by hand.'
        }
      />

      <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
        <div className="grid gap-5">
          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <Sparkles className="h-4 w-4 text-[#58c28d]" />
              Basic information
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Operator*">
                <select value={form.operator} onChange={setField('operator')} className={fieldClass}>
                  {OPERATORS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Category*">
                <select value={form.category} onChange={setField('category')} className={fieldClass}>
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
              <Field label="Price (₹)*">
                <input
                  type="number"
                  min="1"
                  step="any"
                  inputMode="decimal"
                  value={form.price}
                  onChange={setField('price')}
                  className={fieldClass}
                  placeholder="299"
                />
              </Field>
              <Field label="Validity (days)*">
                <input
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  inputMode="numeric"
                  value={form.validityDays}
                  onChange={setField('validityDays')}
                  className={fieldClass}
                  placeholder="28"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <CircleDot className="h-4 w-4 text-[#58c28d]" />
              Data benefits
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Field label="Daily data (GB)">
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={form.dailyData}
                  onChange={setField('dailyData')}
                  className={fieldClass}
                  placeholder="2"
                />
              </Field>
              <Field label="Total data (GB)" hint="Calculated automatically when daily data is set.">
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  value={form.totalData}
                  onChange={setField('totalData')}
                  className={fieldClass}
                  placeholder="56"
                />
              </Field>
              <Field label="SMS (per day)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.sms}
                  onChange={setField('sms')}
                  className={fieldClass}
                  placeholder="100"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Unlimited Calls" on={isUnlimitedCalls} onClick={() => setIsUnlimitedCalls((v) => !v)} />
              <Toggle label="Unlimited SMS" on={isUnlimitedSMS} onClick={() => setIsUnlimitedSMS((v) => !v)} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                <ChevronRight className="h-4 w-4 text-[#58c28d]" />
                OTT benefits
              </div>
              <div className="shrink-0 text-xs text-zinc-500">{selectedOtt.length} selected</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {OTT_OPTIONS.map((item) => {
                const activeChip = selectedOtt.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleOtt(item)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                      activeChip
                        ? 'border-[#58c28d]/25 bg-[#58c28d]/12 text-[#dff6ea]'
                        : 'border-white/10 bg-[#181818] text-zinc-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Status</div>
                <p className="mt-2 text-sm text-zinc-400">Inactive plans are hidden from the public catalogue.</p>
              </div>
              <button
                type="button"
                onClick={() => setActive((v) => !v)}
                aria-pressed={active}
                aria-label="Toggle plan active status"
                className={`relative h-8 w-14 shrink-0 rounded-full border transition-all duration-300 ${
                  active ? 'border-[#58c28d]/30 bg-[#58c28d]/15' : 'border-white/10 bg-[#181818]'
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full transition-all duration-300 ${
                    active ? 'left-7 bg-[#58c28d]' : 'left-1 bg-zinc-500'
                  }`}
                />
              </button>
            </div>
          </section>

          {error && (
            <div className="break-words rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/admin/plans"
              className="w-full rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-center text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white sm:w-auto"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-5 py-3 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Save plan'
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default PlanForm;