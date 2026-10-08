import { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, Plus, UploadCloud, RotateCw, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSearchBar from '../../components/admin/AdminSearchBar';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminActionButtons from '../../components/admin/AdminActionButtons';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminModal from '../../components/admin/AdminModal';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { deletePlansBulk, getAdminPlans } from '../../api/admin.api';
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
  { key: 'select', header: 'Select' },
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const flashToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

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

  const filteredPlans = useMemo(() => {
    const query = search.trim().toLowerCase();

    return adminPlans.filter((plan) => {
      const matchesSearch =
        !query ||
        plan.operator?.toLowerCase().includes(query) ||
        plan.category?.toLowerCase().includes(query) ||
        String(plan.price).includes(query);

      const matchesOperator = operatorFilter === 'All operators' || plan.operator === operatorFilter;
      const matchesCategory = categoryFilter === 'All categories' || plan.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'All status' ||
        (statusFilter === 'Active' ? plan.isActive : !plan.isActive);

      return matchesSearch && matchesOperator && matchesCategory && matchesStatus;
    });
  }, [adminPlans, search, operatorFilter, categoryFilter, statusFilter]);

  const allFilteredSelected =
    filteredPlans.length > 0 && filteredPlans.every((plan) => selectedIds.includes(plan._id));

  const toggleSelected = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));

  const toggleSelectAll = () =>
    setSelectedIds(allFilteredSelected ? [] : filteredPlans.map((plan) => plan._id));

  // One confirmation flow covers a single row, a selection and the whole catalog.
  const requestDelete = ({ kind, plan = null, ids = [], count = 0 }) =>
    setConfirmDelete({ kind, plan, ids, count });

  const runDelete = async () => {
    if (!confirmDelete || busy) return;
    setBusy(true);
    try {
      const payload = confirmDelete.kind === 'all' ? { all: true } : { ids: confirmDelete.ids };
      const { data } = await deletePlansBulk(payload);
      flashToast(data.message || 'Plans deleted');
      await fetchAdminPlans();
      setSelectedIds([]);
      setConfirmDelete(null);
    } catch (err) {
      flashToast(
        typeof err?.response?.data === 'string' ? err.response.data : 'Could not delete the plans'
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (location.state?.created) {
      flashToast('Plan created successfully');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);

  useEffect(() => {
    fetchAdminPlans();
  }, []);

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 rounded-2xl border border-[#58c28d]/30 bg-[#1f1f1f] px-5 py-4 text-sm text-[#58c28d] shadow-xl backdrop-blur-sm"
          >
            ✓ {toast}
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
                  {['All operators', 'Jio', 'Airtel', 'VI', 'BSNL'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-[#58c28d]/40"
                >
                  {['All categories', 'Daily', 'Non-Daily'].map((item) => (
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
              <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-zinc-500">
                <span>Showing {filteredPlans.length} of {adminPlans.length} plans</span>
                <button
                  onClick={() => {
                    setSearch('');
                    setOperatorFilter('All operators');
                    setCategoryFilter('All categories');
                    setStatusFilter('All status');
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

      {/* Selection + bulk delete */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#1f1f1f] p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectAll}
            disabled={filteredPlans.length === 0}
            className="rounded-2xl border border-white/10 bg-[#262626] px-4 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allFilteredSelected ? 'Clear selection' : `Select all ${filteredPlans.length}`}
          </button>
          <span className="text-xs text-zinc-500">
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Nothing selected'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => requestDelete({ kind: 'selected', ids: selectedIds, count: selectedIds.length })}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 transition-all duration-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
          </button>
          <button
            type="button"
            onClick={() => requestDelete({ kind: 'all', count: adminPlans.length })}
            disabled={adminPlans.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/20 px-4 py-2.5 text-sm font-medium text-red-200 transition-all duration-300 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete all plans
          </button>
        </div>
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
            data={filteredPlans}
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
                    onDelete={() => requestDelete({ kind: 'one', plan: row, ids: [row._id], count: 1 })}
                  />
                );
              }
              if (col.key === 'select') {
                return (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row._id)}
                    onChange={() => toggleSelected(row._id)}
                    aria-label={`Select ${row.operator} ₹${row.price}`}
                    className="h-4 w-4 cursor-pointer accent-[#58c28d]"
                  />
                );
              }
              return row[col.key] ?? '—';
            }}
          />
        )}
      </motion.section>

      {/* Delete confirmation – shared by one row, a selection and the catalog */}
      <AdminModal
        isOpen={confirmDelete !== null}
        title={
          confirmDelete?.kind === 'all'
            ? 'Delete every plan?'
            : confirmDelete?.kind === 'selected'
              ? `Delete ${confirmDelete.count} selected plan${confirmDelete.count === 1 ? '' : 's'}?`
              : 'Delete plan?'
        }
        message={
          confirmDelete?.kind === 'all'
            ? `This permanently removes all ${adminPlans.length} plans in the catalog, along with their price history and any pending proposals. This cannot be undone.`
            : confirmDelete?.kind === 'selected'
              ? `This permanently removes ${confirmDelete.count} selected plan${confirmDelete.count === 1 ? '' : 's'}, along with their price history. This cannot be undone.`
              : confirmDelete?.plan
                ? `This permanently removes the ${confirmDelete.plan.operator} ₹${confirmDelete.plan.price} plan, along with its price history. This cannot be undone.`
                : ''
        }
        confirmLabel={busy ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={runDelete}
        onCancel={() => {
          if (!busy) setConfirmDelete(null);
        }}
      />
    </>
  );
};

export default Plans;
