import { useEffect, useMemo, useState } from 'react';
import { Filter, Plus, UploadCloud } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatCard from '../../components/admin/AdminStatCard';
import AdminSearchBar from '../../components/admin/AdminSearchBar';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminActionButtons from '../../components/admin/AdminActionButtons';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { NavLink } from "react-router-dom";
import { useLocation } from 'react-router-dom'
import {deletePlan, getAdminPlans} from '../../api/admin.api'
import { useNavigate } from 'react-router-dom';

const columns = [
  { key: 'operator', header: 'Operator' },
  { key: 'category', header: 'Category' },
  { key: 'price', header: 'Price' },
  { key: 'validityDays', header: 'Validity (days)' },
  { key: 'data', header: 'Data' },        
  { key: 'isActive', header: 'Status' },
  { key: 'updatedAt', header: 'Updated' },
  { key: 'actions', header: 'Actions' },
];

const Plans = () => {
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('All operators');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All status');
  const location = useLocation()
  const [showToast, setShowToast] = useState(false)
  const [adminPlans, setAdminPlans] = useState([])
  const navigate = useNavigate();

  // const filteredPlans = useMemo(() => {
  //   return samplePlans;
  // }, [search, operatorFilter, categoryFilter, statusFilter]);

  const fetchAdminPlans = async () => {
    try {
      const {data} = await getAdminPlans();
      setAdminPlans(data.plans)
    } catch (err) {
      console.error(err.response.data)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deletePlan(id);
      setAdminPlans(prev => prev.filter(plan => plan._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  useEffect(() => {
    
    if(location.state?.created){
      setShowToast(true)
      navigate(location.pathname, { replace: true, state: {} });  
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
    console.log(location.state?.created);
    fetchAdminPlans()
  }, [])

  return (
    <AdminLayout>
      {/* Plan Created Notification */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl border border-[#58c28d]/30 bg-[#1f1f1f] px-5 py-4 text-sm text-[#58c28d] shadow-xl">
          ✓ Plan created successfully
        </div>
      )}

      {/* Plan Header */}
      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Plans management"
        description="Track the catalog, review every row, and keep each plan aligned with the latest source data."
        actions={
          <>
            <NavLink
              to="/admin/upload-csv"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
            >
              <UploadCloud className="h-4.5 w-4.5" />
              Import CSV
            </NavLink>
            <NavLink
              to="/admin/plans/create"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0]"
            >
              <Plus className="h-4.5 w-4.5" />
              Add plan
            </NavLink>
          </>
        }
      />

      {/* Plan AdminStatCard */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total plans" value="24" hint="All operators combined" />
        <AdminStatCard label="Active" value="21" hint="Currently visible plans" />
        <AdminStatCard label="Operators" value="3" hint="Jio • Airtel • Vi" />
        <AdminStatCard label="Pending changes" value="3" hint="Awaiting approval" tone="warning" />
      </section>

      {/* Plan Filters */}
      <section className="mt-5 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[2fr_0.7fr_0.7fr_0.7fr]">
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
            {['Daily', 'Non-Daily'].map((item) => (
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

      {/* Plan Table */}
      <section className="mt-5">
        <AdminTable
          columns={columns}
          data={adminPlans}
          emptyState={
            <AdminEmptyState
              title="No plans found"
              message="Use the search and filters to narrow the list, or keep this as the empty-state component for later live data."
            />
          }
          renderCell={(row, col) => {
            if (col.key === 'data') {
              if (row.dailyData != null) return `${row.dailyData} GB/day`;
              if (row.totalData != null) return `${row.totalData} GB total`;
              return 'N/A';
            }
            if (col.key === 'price') return `₹${row.price}`;
            if (col.key === 'isActive') 
              return <AdminStatusBadge status={row.isActive ? 'Active' : 'Inactive'} />;
            if (col.key === 'updatedAt') 
              return new Date(row.updatedAt).toLocaleDateString('en-IN');
            if (col.key === 'actions') {
              return (
                <AdminActionButtons
                  onEdit={() => navigate(`/admin/plans/edit/${row._id}`)}
                  onDelete={() => handleDelete(row._id)}
                />
              );
            }
            return row[col.key]?? '—';
          }}
        />
      </section>
    </AdminLayout>
  );
};

export default Plans;
