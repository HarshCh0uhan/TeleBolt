import { useMemo, useState } from 'react';
import { Check, ChevronRight, CircleDot, Sparkles } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { Link, useNavigate } from "react-router-dom";
import {createPlan} from '../../api/admin.api'

const ottOptions = ["JioHotstar", "Prime", "Netflix", "SonyLiv", "Zee5", "Other"];

const Input = ({ label, children, hint }) => (
  <label className="block">
    <div className="mb-2 text-sm font-medium text-zinc-300">{label}</div>
    {children}
  </label>
);

const PlanForm = () => {
  const [selectedOtt, setSelectedOtt] = useState([]);
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  const [price, setPrice] = useState(null);
  const [validityDays, setValidityDays] = useState(null);
  const [dailyData, setDailydata] = useState(null);
  const [totalData, setTotaldata] = useState(null);
  const [sms, setSms] = useState(null); 
  const [operator, setOperator] = useState('Jio');
  const [category, setCategory] = useState('Daily');
  const [isUnlimitedCalls, setIsUnlimitedCalls] = useState(true);
  const [isUnlimitedSMS, setIsUnlimitedSMS] = useState(false);

  const chipList = useMemo(() => ottOptions, []);

  const toggleOtt = (item) => {
    setSelectedOtt((current) =>
      current.includes(item) ? current.filter((x) => x !== item) : [...current, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createPlan({
        operator, 
        category, 
        price, 
        validityDays, 
        dailyData, 
        totalData, 
        sms, 
        isUnlimitedCalls, 
        isUnlimitedSMS, 
        ottApps: selectedOtt, 
        isActive: active
      });
      navigate('/admin/plans', { state: { created: true } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Plan form"
        description="Keep the form clean and premium. Put the logic wherever you want later; the UI is already structured for it."
      />

      <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 sm:p-6">
        <div className="grid gap-5">

          {/* Basic Information */}
          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <Sparkles className="h-4 w-4 text-[#58c28d]" />
              Basic information
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Operator*">
                <select onChange={(e) => setOperator(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40">
                  <option>Jio</option>
                  <option>Airtel</option>
                  <option>VI</option>
                </select>
              </Input>
              <Input label="Category*">
                <select onChange={(e) => setCategory(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40">
                  <option>Daily</option>
                  <option>Non-Daily</option>
                </select>
              </Input>
              <Input label="Price*">
                <input onChange={(e) => setPrice(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40" placeholder="299" />
              </Input>
              <Input label="Validity (days)*">
                <input onChange={(e) => setValidityDays(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40" placeholder="28" />
              </Input>
            </div>
          </section>

          {/* Data Benefits */}
          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <CircleDot className="h-4 w-4 text-[#58c28d]" />
              Data benefits
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Input label="Daily data">
                <input onChange={(e) => setDailydata(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40" placeholder="2 GB" />
              </Input>
              <Input label="Total data">
                <input onChange={(e) => setTotaldata(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40" placeholder="56 GB" />
              </Input>
              <Input label="SMS">
                <input onChange={(e) => setSms(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#181818] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-zinc-600 focus:border-[#58c28d]/40" placeholder="100/day" />
              </Input>
            </div>
          </section>

          {/* Calling & SMS Toggles */}
          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsUnlimitedCalls(prev => !prev)}
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
                onClick={() => setIsUnlimitedSMS(prev => !prev)}
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

          {/* OTT Benefits */}
          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                  <ChevronRight className="h-4 w-4 text-[#58c28d]" />
                  OTT benefits
                </div>
                <p className="mt-2 text-sm text-zinc-400">Chips switch on and off with the same active-green feel used everywhere else.</p>
              </div>
              <div className="text-xs text-zinc-500">{selectedOtt.length} selected</div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {chipList.map((item) => {
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

          {/* Active or Not */}
          <section className="rounded-3xl border border-white/10 bg-[#262626] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Status</div>
                <p className="mt-2 text-sm text-zinc-400">Keep this toggle visually obvious without feeling loud.</p>
              </div>
              <button
                type="button"
                onClick={() => setActive((v) => !v)}
                className={`relative h-8 w-14 rounded-full border transition-all duration-300 ${
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

          {/* Error Display */}
          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit or Cancel */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/admin/plans"
              className="rounded-2xl border border-white/10 bg-[#262626] px-5 py-3 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group flex rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-5 py-3 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save plan"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanForm;