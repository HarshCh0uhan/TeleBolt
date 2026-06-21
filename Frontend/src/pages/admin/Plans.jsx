import { useMemo, useState } from 'react';
import { Filter, Plus, UploadCloud } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminSearchBar from '../../components/admin/AdminSearchBar';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminActionButtons from '../../components/admin/AdminActionButtons';
import AdminEmptyState from '../../components/admin/AdminEmptyState';

const samplePlans = [
  { id: 1, operator: 'Jio', price: '₹299', validity: '28d', dataPerDay: '2 GB', totalData: '56 GB', category: 'Popular', status: 'Active', updated: 'May 1' },
  { id: 2, operator: 'Airtel', price: '₹349', validity: '28d', dataPerDay: '2 GB', totalData: '56 GB', category: 'Premium', status: 'Active', updated: 'Apr 28' },
  { id: 3, operator: 'Vi', price: '₹269', validity: '28d', dataPerDay: '1.5 GB', totalData: '42 GB', category: 'Value', status: 'Active', updated: 'Apr 20' },
  { id: 4, operator: 'Jio', price: '₹2,999', validity: '365d', dataPerDay: '2.5 GB', totalData: '730 GB', category: 'Annual', status: 'Active', updated: 'Apr 15' },
  { id: 5, operator: 'Airtel', price: '₹179', validity: '18d', dataPerDay: '1 GB', totalData: '18 GB', category: 'Entry', status: 'Inactive', updated: 'Mar 10' },
];

const columns = [
  { key: 'operator', header: 'Operator' },
  { key: 'price', header: 'Price' },
  { key: 'validity', header: 'Validity' },
  { key: 'dataPerDay', header: 'Data / day' },
  { key: 'totalData', header: 'Total data' },
  { key: 'status', header: 'Status' },
  { key: 'updated', header: 'Updated' },
  { key: 'actions', header: 'Actions' },
];

const Plans = () => {
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('All operators');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All status');

  const filteredPlans = useMemo(() => {
    // TODO: wire real filtering logic
    return samplePlans;
  }, [search, operatorFilter, categoryFilter, statusFilter]);

  return (
    <AdminLayout>
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Plans management"
        description="Track the catalog, review every row, and keep each plan aligned with the latest source data."
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
            >
              <UploadCloud className="h-4.5 w-4.5" />
              Import CSV
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0]"
            >
              <Plus className="h-4.5 w-4.5" />
              Add plan
            </button>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total plans" value="24" hint="All operators combined" />
        <AdminStatCard label="Active" value="21" hint="Currently visible plans" />
        <AdminStatCard label="Operators" value="3" hint="Jio • Airtel • Vi" />
        <AdminStatCard label="Pending changes" value="3" hint="Awaiting approval" tone="warning" />
      </section>

      <section className="mt-5 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search Jio 299, Airtel 349, Vi 269…"
          />
          <select
            value={operatorFilter}
            onChange={(e) => setOperatorFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40"
          >
            {['All operators', 'Jio', 'Airtel', 'Vi'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40"
          >
            {['All categories', 'Popular', 'Premium', 'Value', 'Annual', 'Entry'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40"
          >
            {['All status', 'Active', 'Inactive'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
          <Filter className="h-3.5 w-3.5 text-[#58c28d]" />
          Filters are visual only here. Connect the logic later.
        </div>
      </section>

      <section className="mt-5">
        <AdminTable
          columns={columns}
          data={filteredPlans}
          emptyState={
            <AdminEmptyState
              title="No plans found"
              message="Use the search and filters to narrow the list, or keep this as the empty-state component for later live data."
            />
          }
          renderCell={(row, col) => {
            if (col.key === 'status') return <AdminStatusBadge status={row.status} />;
            if (col.key === 'actions') {
              return (
                <AdminActionButtons
                  onView={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              );
            }
            return row[col.key];
          }}
        />
      </section>
    </AdminLayout>
  );
};

export default Plans;
