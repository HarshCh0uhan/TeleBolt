import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSinglePlan } from '../api/plans.api';
import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeIndianRupee, CalendarDays, Database, MessageSquare, Phone, Sparkles, Check, X } from 'lucide-react';

// A simple mock plan for layout purposes. You will replace this with API data.
const mockPlan = {
  _id: '1',
  operator: 'Jio',
  price: 299,
  validityDays: 28,
  dailyData: 2,
  totalData: 56,
  sms: 100,
  isUnlimitedCalls: true,
  ottApps: ['JioHotstar', 'Prime'],
  yearlyCost: 3887,
  yearlyData: 728,
  costPerGB: 5.34,
  isActive: true
};

const Compare = () => {
  const [plans, setPlans] = useState([mockPlan, mockPlan]); // Two mocks for layout
  const [loading, setLoading] = useState(false);

  // TODO: You will implement the logic to fetch plans by IDs from the URL or state
  // Example: useEffect(() => { fetchPlans(); }, []);

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#1f1f1f]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-[#58c28d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Plans
          </button>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Plan Comparison
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Compare plans side-by-side to find the best value for your money.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className="overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f] transition-all duration-300 hover:border-[#58c28d]/30"
            >
              {/* Hero Section */}
              <div className="border-b border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex rounded-full bg-[#58c28d]/10 px-3 py-1 text-xs font-medium text-[#58c28d]">
                      {plan.operator}
                    </span>
                    <h2 className="mt-4 text-4xl font-bold tracking-tight text-white">
                      ₹{plan.price}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      {plan.validityDays} Days Validity
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-4 py-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-400">Value</p>
                    <p className="mt-1 text-lg font-semibold text-[#58c28d]">
                      ₹{plan.costPerGB || "--"}/GB
                    </p>
                  </div>
                </div>
              </div>

              {/* Yearly Normalization */}
              <div className="p-6">
                <div className="rounded-2xl bg-[#262626] p-5">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">
                    Estimated Yearly Cost
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    ₹{plan.yearlyCost || "--"}<span className="text-base font-normal text-zinc-500">/year</span>
                  </p>
                </div>
              </div>

              {/* Details Breakdown */}
              <div className="px-6 pb-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Benefits Breakdown
                </h3>
                <div className="space-y-3">
                  {/* Data */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <Database className="h-4 w-4 text-[#58c28d]" />
                      <span className="text-sm">{plan.dailyData ? "Daily Data" : "Total Data"}</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {plan.dailyData ? `${plan.dailyData} GB/day` : `${plan.totalData} GB`}
                    </span>
                  </div>

                  {/* Validity */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <CalendarDays className="h-4 w-4 text-[#58c28d]" />
                      <span className="text-sm">Total Data</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {plan.totalData} GB
                    </span>
                  </div>

                  {/* Calls */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <Phone className="h-4 w-4 text-[#58c28d]" />
                      <span className="text-sm">Calls</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {plan.isUnlimitedCalls ? "Unlimited" : "Limited"}
                    </span>
                  </div>

                  {/* SMS */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3">
                    <div className="flex items-center gap-3 text-zinc-300">
                      <MessageSquare className="h-4 w-4 text-[#58c28d]" />
                      <span className="text-sm">SMS</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {plan.sms ? `${plan.sms}/day` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* OTT Apps */}
              <div className="px-6 pb-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  OTT Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.ottApps && plan.ottApps.length > 0 ? (
                    plan.ottApps.map((ott) => (
                      <span key={ott} className="inline-flex items-center gap-1.5 rounded-xl border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-2 text-xs text-[#dff6ea]">
                        <Sparkles className="h-3 w-3" />
                        {ott}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#262626] px-3 py-2 text-xs text-zinc-400">
                      <X className="h-3 w-3" />
                      No OTT Benefits
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Compare;