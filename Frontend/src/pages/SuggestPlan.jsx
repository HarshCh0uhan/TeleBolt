import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Check, Loader2, Sparkles, CircleDot, ChevronRight, ArrowLeft } from 'lucide-react';
import { submitPlan } from '../api/plans.api';

const OTT_OPTIONS = ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5", "Other"];

const Input = ({ label, children }) => (
  <label className="block">
    <div className="mb-2 text-sm font-medium text-zinc-300">{label}</div>
    {children}
  </label>
);

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40";

const SuggestPlan = () => {
  const [operator, setOperator] = useState('Jio');
  const [category, setCategory] = useState('Daily');
  const [price, setPrice] = useState('');
  const [validityDays, setValidityDays] = useState('');
  const [dailyData, setDailyData] = useState('');
  const [totalData, setTotalData] = useState('');
  const [sms, setSms] = useState('');
  const [isUnlimitedCalls, setIsUnlimitedCalls] = useState(true);
  const [isUnlimitedSMS, setIsUnlimitedSMS] = useState(false);
  const [selectedOtt, setSelectedOtt] = useState([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const toggleOtt = (item) => {
    setSelectedOtt((current) =>
      current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
    );
  };

  const resetForm = () => {
    setPrice('');
    setValidityDays('');
    setDailyData('');
    setTotalData('');
    setSms('');
    setNote('');
    setSelectedOtt([]);
    setIsUnlimitedCalls(true);
    setIsUnlimitedSMS(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await submitPlan({
        operator,
        category,
        price,
        validityDays,
        dailyData: dailyData || undefined,
        totalData: totalData || undefined,
        sms: sms || undefined,
        isUnlimitedCalls,
        isUnlimitedSMS,
        ottApps: selectedOtt,
        note,
      });
      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(typeof err?.response?.data === 'string' ? err.response.data : 'Could not submit the plan.');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#181818] px-4 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1f1f1f] p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-[#58c28d]/30 bg-[#58c28d]/10">
            <Check className="h-8 w-8 text-[#58c28d]" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-white">Plan submitted!</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Thanks for contributing. An admin will review your suggestion and either add it to the
            catalog or decline it.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => setSuccess(false)}
              className="rounded-2xl border border-[#58c28d]/30 bg-[#58c28d]/10 px-5 py-3 text-sm font-medium text-[#dff6ea] transition hover:bg-[#58c28d]/20"
            >
              Submit another plan
            </button>
            <Link
              to="/"
              className="rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-sm text-zinc-300 transition hover:border-[#58c28d]/30 hover:text-white"
            >
              Back to plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#181818]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-[#58c28d]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Plans
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Suggest a Plan</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Spotted a plan that TeleBolt is missing? Send it in — an admin will review it before it
            goes live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Basic information */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <Sparkles className="h-4 w-4 text-[#58c28d]" />
              Basic information
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Operator*">
                <select value={operator} onChange={(e) => setOperator(e.target.value)} className={inputClass}>
                  <option>Jio</option>
                  <option>Airtel</option>
                  <option>VI</option>
                  <option>BSNL</option>
                </select>
              </Input>
              <Input label="Category*">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  <option>Daily</option>
                  <option>Non-Daily</option>
                </select>
              </Input>
              <Input label="Price (₹)*">
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputClass}
                  placeholder="299"
                  required
                />
              </Input>
              <Input label="Validity (days)*">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  className={inputClass}
                  placeholder="28"
                  required
                />
              </Input>
            </div>
          </section>

          {/* Data benefits */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <CircleDot className="h-4 w-4 text-[#58c28d]" />
              Data benefits
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Input label="Daily data (GB)">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={dailyData}
                  onChange={(e) => setDailyData(e.target.value)}
                  className={inputClass}
                  placeholder="2"
                />
              </Input>
              <Input label="Total data (GB)">
                <input
                  type="number"
                  min="0"
                  value={totalData}
                  onChange={(e) => setTotalData(e.target.value)}
                  className={inputClass}
                  placeholder="56"
                />
              </Input>
              <Input label="SMS (per day)">
                <input
                  type="number"
                  min="0"
                  value={sms}
                  onChange={(e) => setSms(e.target.value)}
                  className={inputClass}
                  placeholder="100"
                />
              </Input>
            </div>
          </section>

          {/* Calling & SMS toggles */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsUnlimitedCalls((v) => !v)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 ${
                  isUnlimitedCalls
                    ? 'border-[#58c28d]/40 bg-[#58c28d]/10 text-white'
                    : 'border-white/10 bg-[#181818] text-zinc-300'
                }`}
              >
                <span>Unlimited Calls</span>
                <span className="rounded-full border border-[#58c28d]/20 bg-[#58c28d]/10 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-[#dff6ea]">
                  {isUnlimitedCalls ? 'ON' : 'OFF'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsUnlimitedSMS((v) => !v)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-all duration-300 ${
                  isUnlimitedSMS
                    ? 'border-[#58c28d]/40 bg-[#58c28d]/10 text-white'
                    : 'border-white/10 bg-[#181818] text-zinc-300'
                }`}
              >
                <span>Unlimited SMS</span>
                <span className="rounded-full border border-[#58c28d]/20 bg-[#58c28d]/10 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-[#dff6ea]">
                  {isUnlimitedSMS ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </section>

          {/* OTT */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                <ChevronRight className="h-4 w-4 shrink-0 text-[#58c28d]" />
                OTT benefits
              </div>
              <div className="text-xs text-zinc-500">{selectedOtt.length} selected</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {OTT_OPTIONS.map((item) => {
                const active = selectedOtt.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleOtt(item)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 ${
                      active
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

          {/* Note */}
          <section className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-6">
            <Input label="Anything else? (optional)">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Source link, plan code, or why this plan matters…"
              />
            </Input>
            <p className="mt-2 text-xs text-zinc-600">{note.length}/500</p>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/"
              className="w-full rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-center text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white sm:w-auto"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-5 py-3 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit for review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuggestPlan;
