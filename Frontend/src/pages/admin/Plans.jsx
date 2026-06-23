import { useEffect, useState } from 'react';
import { Filter, Plus, UploadCloud, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSearchBar from '../../components/admin/AdminSearchBar';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminActionButtons from '../../components/admin/AdminActionButtons';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { deletePlan, getAdminPlans } from '../../api/admin.api';
import { motion, AnimatePresence } from 'framer-motion';

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

const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-16 rounded-2xl bg-[#262626] animate-pulse"
      />
    ))}
  </div>
);

const Plans = () => {
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('All operators');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [showFilters, setShowFilters] = useState(false);
  const [adminPlans, setAdminPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchAdminPlans = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminPlans();
      setAdminPlans(data.plans);
    } catch (err) {
      console.error(err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlan(id);
      setAdminPlans(prev => prev.filter(plan => plan._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  useEffect(() => {
    if (location.state?.created) {
      setShowToast(true);
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    fetchAdminPlans();
  }, []);

  return (
    <AdminLayout>
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-2xl border border-[#58c28d]/30 bg-[#1f1f1f] px-5 py-4 text-sm text-[#58c28d] shadow-xl backdrop-blur-sm"
          >
            ✓ Plan created successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AdminPageHeader
          eyebrow="Admin Dashboard"
          title="Plans management"
          description="Track the catalog, review every row, and keep each plan aligned with the latest source data."
          actions={
            <>
              <button
                onClick={fetchAdminPlans}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
              >
                <RotateCw className="h-4 w-4" />
                Refresh
              </button>
              <NavLink
                to="/admin/upload-csv"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
              >
                <UploadCloud className="h-4 w-4" />
                Import CSV
              </NavLink>
              <NavLink
                to="/admin/plans/create"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#58c28d]/25 bg-[#58c28d] px-4 py-2.5 text-sm font-medium text-[#181818] transition-all duration-300 hover:bg-[#6dd9a0]"
              >
                <Plus className="h-4 w-4" />
                Add plan
              </NavLink>
            </>
          }
        />
      </motion.div>

      {/* Filters – collapsible */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-5 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 sm:p-5"
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-between text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#58c28d]" />
            <span className="font-medium">Filters & search</span>
          </div>
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid gap-3 lg:grid-cols-[2fr_0.7fr_0.7fr_0.7fr]">
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
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Showing {adminPlans.length} plans</span>
                <button
                  onClick={() => {
                    setSearch('');
                    setOperatorFilter('All operators');
                    setCategoryFilter('All categories');
                    setStatusFilter('All status');
                    // TODO: wire clear filters logic
                  }}
                  className="text-[#58c28d] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Table */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mt-5"
      >
        {loading ? (
          <TableSkeleton rows={6} />
        ) : (
          <AdminTable
            columns={columns}
            data={adminPlans}
            emptyState={
              <AdminEmptyState
                title="No plans found"
                message="Try adjusting your search or filters, or create a new plan to get started."
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
              return row[col.key] ?? '—';
            }}
          />
        )}
      </motion.section>
    </AdminLayout>
  );
};

export default Plans;