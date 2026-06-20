import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ListChecks,
  PlusCircle,
  GitCompareArrows,
  UploadCloud,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/plans", label: "Manage Plans", icon: ListChecks },
  { to: "/admin/plans/create", label: "Create Plan", icon: PlusCircle },
  { to: "/admin/detected", label: "Detected Changes", icon: GitCompareArrows },
  { to: "/admin/upload-csv", label: "Upload CSV", icon: UploadCloud },
];

// Wraps every /admin/* page. Pass `title` + optional `description` for the
// page header; `actions` slots buttons into the top-right (e.g. "New Plan").
const AdminLayout = ({ title, description, actions, children }) => {
  return (
    <div className="flex min-h-screen bg-[#181818]">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-[#1f1f1f] lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <div className="h-2 w-2 rounded-full bg-[#58c28d]" />
          <span className="text-sm font-semibold tracking-wide text-white">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#58c28d]/10 text-[#58c28d]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="min-w-0 flex-1">
        <header className="border-b border-white/10 bg-[#1f1f1f]">
          <div className="flex items-center justify-between gap-4 px-4 py-6 sm:px-8">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-1.5 text-sm text-zinc-400">{description}</p>
              )}
            </div>

            {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
          </div>
        </header>

        <main className="px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;