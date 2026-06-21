import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminActionButtons from '../../components/admin/AdminActionButtons';
import { Clock3, BadgeCheck, XCircle, FileClock } from 'lucide-react';

const changes = [
  { id: 1, plan: 'Jio 299', field: 'Price', oldValue: '₹299', newValue: '₹279', status: 'Pending' },
  { id: 2, plan: 'Airtel 349', field: 'Validity', oldValue: '28 days', newValue: '30 days', status: 'Pending' },
  { id: 3, plan: 'Vi 269', field: 'Data/day', oldValue: '1.5 GB', newValue: '2 GB', status: 'Review' },
];

const DetectedChanges = () => {
  return (
    <AdminLayout>
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Detected changes"
        description="Review incoming edits, accept the clean ones, and reject the noisy ones without breaking the TeleBolt visual language."
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Pending" value="12" hint="Waiting for manual approval" icon={Clock3} tone="warning" />
        <AdminStatCard label="Approved" value="4" hint="Merged into the catalog" icon={BadgeCheck} tone="success" />
        <AdminStatCard label="Rejected" value="3" hint="Kept out of the live list" icon={XCircle} tone="danger" />
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-[#1f1f1f] p-5">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
          <FileClock className="h-4 w-4 text-[#58c28d]" />
          Review queue
        </div>

        <div className="mt-5 grid gap-3">
          {changes.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-white/10 bg-[#262626] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#58c28d]/30"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-white">{item.plan}</h3>
                    <AdminStatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    <span className="text-zinc-300">{item.field}</span> changed from{' '}
                    <span className="text-white">{item.oldValue}</span> to{' '}
                    <span className="text-[#58c28d]">{item.newValue}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <AdminActionButtons
                    onApprove={() => {}}
                    onReject={() => {}}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
};

export default DetectedChanges;
