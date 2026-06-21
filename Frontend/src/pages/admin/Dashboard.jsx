import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { Activity, BadgeIndianRupee, Layers3, UploadCloud, Clock3, BellRing, ArrowRight } from 'lucide-react';
import {NavLink} from 'react-router-dom'

const activity = [
  { title: 'CSV uploaded', meta: 'Today • 10:30 AM', tone: 'success' },
  { title: 'Plan updated', meta: 'Jio 299 • 4 minutes ago', tone: 'default' },
  { title: 'Change approved', meta: 'Airtel 349 • Yesterday', tone: 'default' },
  { title: 'Pending review', meta: '3 plans awaiting approval', tone: 'warning' },
];

const Dashboard = () => {

  return (
    <AdminLayout>
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Welcome back, Admin"
        description="Monitor plans, review detected changes, and keep uploads clean from one place."
        actions={
          <>
          {/* Future Plans */}
            {/* <button
              type="button"
              className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
            >
              View audit log
            </button> */}
            
            <NavLink
              to="/admin/plans"
              className="rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0]"
            >
              Open plans
            </NavLink>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#58c28d]/30">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#58c28d]/20 bg-[#58c28d]/10 px-3 py-1 text-xs text-[#dff6ea]">
                <BellRing className="h-3.5 w-3.5" />
                Admin console online
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Everything important lives here.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Track plan volume, review incoming changes, and push bulk updates with the same calm TeleBolt look used in the public app.
              </p>
            </div>

            <div className="grid min-w-[220px] gap-3 rounded-3xl border border-white/10 bg-[#262626] p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1f1f1f] p-3">
                <Clock3 className="h-4.5 w-4.5 text-[#58c28d]" />
                <div>
                  <div className="text-sm text-white">Session healthy</div>
                  <div className="text-xs text-zinc-500">Auto refresh enabled</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1f1f1f] p-3">
                <Activity className="h-4.5 w-4.5 text-[#58c28d]" />
                <div>
                  <div className="text-sm text-white">Live queue</div>
                  <div className="text-xs text-zinc-500">4 items waiting</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#58c28d]/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Quick actions</div>
              <h3 className="mt-2 text-lg font-medium text-white">Fast entry points</h3>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-[#58c28d]">
              <ArrowRight className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {['Add plan', 'Import CSV', 'Review changes', 'Open analytics'].map((item) => (
              <button
                key={item}
                type="button"
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
              >
                <span>{item}</span>
                <ArrowRight className="h-4 w-4 text-zinc-500" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total plans" value="24" hint="2 added this week" icon={Layers3} tone="success" />
        <AdminStatCard label="Active plans" value="21" hint="87.5% of catalog" icon={BadgeIndianRupee} />
        <AdminStatCard label="Pending changes" value="3" hint="Needs manual review" icon={Clock3} tone="warning" />
        <AdminStatCard label="Uploads today" value="5" hint="1 rejected row" icon={UploadCloud} />
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Recent activity</div>
              <h3 className="mt-2 text-lg font-medium text-white">Timeline</h3>
            </div>
            <Activity className="h-5 w-5 text-[#58c28d]" />
          </div>

          <div className="mt-5 space-y-3">
            {activity.map((item, index) => (
              <div
                key={item.title}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:border-[#58c28d]/30 hover:-translate-y-0.5"
              >
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#58c28d] shadow-[0_0_0_4px_rgba(88,194,141,0.08)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{item.title}</div>
                    <div className="text-xs text-zinc-500">0{index + 1}</div>
                  </div>
                  <div className="mt-1 text-sm text-zinc-400">{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#58c28d]/30">
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">System status</div>
            <div className="mt-2 text-lg font-medium text-white">Admin queue is clear</div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Approved changes are flowing through as expected. Use the plans screen for fast edits and the CSV screen for batch updates.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#58c28d]/30">
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Reminder</div>
            <div className="mt-2 text-lg font-medium text-white">Keep the same design tokens</div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Backgrounds stay dark, cards stay elevated, and green only appears where TeleBolt should feel active.
            </p>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Dashboard;
