import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/TeleBolt Logo.png'
import {
  LayoutDashboard,
  ListOrdered,
  FileClock,
  UploadCloud,
  Plus,
  Menu,
  X,
  Sparkles,
  LogOut,
  ChevronRight,
  ShieldCheck,
  History,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdminStats } from '../context/AdminStatsContext';
import { Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Plans', to: '/admin/plans', icon: ListOrdered },
  { label: 'Detected Changes', to: '/admin/detected-changes', icon: FileClock },
  { label: 'Pending Reviews', to: '/admin/pending-reviews', icon: History, badge: true },
  { label: 'Contributions', to: '/admin/contributions', icon: Plus },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldCheck },
  { label: 'Upload CSV', to: '/admin/upload-csv', icon: UploadCloud },
];

const baseLink =
  'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out';

const AdminLayout = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {logoutUser, user} = useAuth()
  const {pendingCount} = useAdminStats()

  const nav = useMemo(() => navItems, []);
  const drawerClass = drawerOpen
    ? 'translate-x-0 opacity-100 pointer-events-auto'
    : '-translate-x-full opacity-0 pointer-events-none';

  return (
    <div className="min-h-screen w-full bg-[#181818] text-white">
      {/* Desktop View */}
      <aside className="fixed inset-y-0 left-0 hidden max-h-screen w-72 flex-col overflow-y-auto border border-white/10 border-r scrollbar-brand lg:flex">
        <div className="flex h-full flex-col px-3 py-5 ">
          <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] py-3">
            <div className="flex items-center justify-center gap-3">
              <img
                src={logo}
                alt="TeleBolt"
                className="h-12 w-auto object-contain"
              />
              <div>
                <div className="text-2xl font-semibold tracking-tight">TeleBolt</div>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-[#58c28d]/20 bg-[#58c28d]/10 px-2.5 py-1 text-xs text-[#cfeedd]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Console
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#1f1f1f] p-3">
            <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              Navigation
            </div>
            <nav className="space-y-1">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.label === 'Dashboard'}
                    className={({ isActive }) =>
                      `${baseLink} ${
                        isActive
                          ? 'border border-[#58c28d]/20 bg-[#58c28d]/12 text-[#e9fff4] shadow-[0_0_0_1px_rgba(88,194,141,0.15)]'
                          : 'border border-transparent text-zinc-400 hover:border-white/10 hover:bg-[#262626] hover:text-white hover:-translate-y-0.5'
                      }`
                    }
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="min-w-6 rounded-full bg-[#58c28d] px-2 py-0.5 text-center text-[11px] font-semibold text-[#181818]">
                        {pendingCount}
                      </span>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-500 transition-transform duration-300 group-hover:translate-x-0.5" />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-[#1f1f1f] p-3">
            <div className="mb-2 px-2 text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              My account
            </div>
            <NavLink
              to="/admin/profile"
              className="group flex items-center gap-3 rounded-2xl px-2 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:bg-[#262626] hover:text-white"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#58c28d]/20 bg-[#58c28d]/10 text-sm font-bold text-[#58c28d]">
                {(user?.username || 'A').trim().charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{user?.username || 'Admin'}</span>
                <span className="block truncate text-[11px] text-zinc-500">{user?.email}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 group-hover:translate-x-0.5" />
            </NavLink>
          </div>

          <div className="mt-auto space-y-3 pt-6">
            <NavLink
              to="/admin/profile"
              className="block rounded-3xl border border-white/10 bg-[#1f1f1f] p-4 transition-all duration-300 hover:border-[#58c28d]/30 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-[#58c28d]">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{user?.username || 'Admin'}</div>
                  <div className="truncate text-xs text-zinc-500">{user?.email || 'admin@example.com'}</div>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-zinc-500" />
              </div>
            </NavLink>

            <button
              type="button"
              className="group mb-3 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
              onClick={logoutUser}
            >
              <span className="flex items-center gap-2">
                <LogOut className="h-4.5 w-4.5" />
                Logout
              </span>
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Mobile View */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#181818]/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <div className="text-xl font-semibold tracking-tight">TeleBolt</div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">Admin Console</div>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[#1f1f1f] text-white transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#262626]"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[86vw] max-w-[320px] border-r border-white/10 bg-[#181818] transition-all duration-300 ease-out ${drawerClass}`}
        >
          <div className="flex h-full flex-col px-4 py-4">
            <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#1f1f1f] p-4">
              <div>
                <div className="text-xl font-semibold tracking-tight">TeleBolt</div>
                <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-[#58c28d]/20 bg-[#58c28d]/10 px-2.5 py-1 text-[11px] text-[#cfeedd]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Console
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#262626] text-white transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <nav className="mt-5 space-y-2">
              {nav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.label === 'Dashboard'}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `${baseLink} ${
                        isActive
                          ? 'border border-[#58c28d]/20 bg-[#58c28d]/12 text-[#e9fff4]'
                          : 'border border-transparent text-zinc-400 hover:border-white/10 hover:bg-[#262626] hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="min-w-6 rounded-full bg-[#58c28d] px-2 py-0.5 text-center text-[11px] font-semibold text-[#181818]">
                        {pendingCount}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto space-y-3 pt-6">
              <div className="rounded-3xl border border-white/10 bg-[#1f1f1f] p-4">
                <div className="text-sm font-medium text-white">{user.email}</div>
                <div className="mt-1 text-xs text-zinc-500">Single-admin workspace</div>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#262626] px-4 py-3 text-sm text-zinc-300 transition-all duration-300 hover:border-[#58c28d]/30 hover:bg-[#58c28d]/10 hover:text-white"
                onClick={logoutUser}
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="min-h-screen px-4 pb-8 pt-4 lg:ml-72 lg:px-8 lg:pt-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
