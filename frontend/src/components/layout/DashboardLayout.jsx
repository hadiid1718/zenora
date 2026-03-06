import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, PlusCircle, BarChart3, Ticket,
  Wallet, Star, Settings, GraduationCap, Menu, X, ChevronLeft,
  Users, ShieldCheck, FolderOpen, FileText, Bell, LogOut,
  ClipboardList,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Avatar from '../ui/Avatar';
import { cn } from '../../lib/utils';

const instructorLinks = [
  { to: '/instructor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
  { to: '/instructor/courses/new', icon: PlusCircle, label: 'Create Course' },
  { to: '/instructor/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/instructor/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/instructor/reviews', icon: Star, label: 'Reviews' },
  { to: '/instructor/withdrawals', icon: Wallet, label: 'Withdrawals' },
  { to: '/instructor/settings', icon: Settings, label: 'Settings' },
];

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/instructors', icon: ShieldCheck, label: 'Instructors' },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  { to: '/admin/categories', icon: FolderOpen, label: 'Categories' },
  { to: '/admin/withdrawals', icon: Wallet, label: 'Withdrawals' },
  { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = user?.role === 'admin' ? adminLinks : instructorLinks;
  const roleLabel = user?.role === 'admin' ? 'Admin Panel' : 'Instructor Panel';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-surface-0 border-r border-surface-200/60 fixed inset-y-0 left-0 z-40">
        <SidebarContent
          links={links}
          roleLabel={roleLabel}
          user={user}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 bg-surface-0 border-r border-surface-200/60 z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-md hover:bg-surface-100"
              >
                <X className="w-5 h-5 text-surface-800/60" />
              </button>
              <SidebarContent
                links={links}
                roleLabel={roleLabel}
                user={user}
                onLogout={handleLogout}
                onNavClick={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-surface-0/80 backdrop-blur border-b border-surface-200/60 flex items-center px-4 sm:px-6 gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 text-surface-800/60"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link
            to="/"
            className="text-sm text-surface-800/50 hover:text-brand-600 flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to site
          </Link>

          <div className="flex-1" />

          <Link
            to="/notifications"
            className="p-2 rounded-lg hover:bg-surface-100 text-surface-800/60"
          >
            <Bell className="w-5 h-5" />
          </Link>

          <Avatar
            src={user?.avatar?.url}
            firstName={user?.firstName}
            lastName={user?.lastName}
            size="sm"
          />
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ links, roleLabel, user, onLogout, onNavClick }) => (
  <>
    {/* Brand */}
    <div className="h-16 flex items-center gap-2 px-5 border-b border-surface-200/60 shrink-0">
      <Link to="/" className="flex items-center gap-2" onClick={onNavClick}>
        <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold gradient-brand-text">Zenora</span>
      </Link>
    </div>

    {/* Role badge */}
    <div className="px-5 pt-4 pb-2">
      <span className="text-xs font-semibold tracking-wider uppercase text-surface-800/40">
        {roleLabel}
      </span>
    </div>

    {/* Nav links */}
    <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNavClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive
                ? 'bg-brand-50 text-brand-700 shadow-sm'
                : 'text-surface-800/60 hover:bg-surface-50 hover:text-surface-900'
            )
          }
        >
          <link.icon className="w-4.5 h-4.5 shrink-0" />
          {link.label}
        </NavLink>
      ))}
    </nav>

    {/* User card */}
    <div className="p-4 border-t border-surface-200/60">
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          src={user?.avatar?.url}
          firstName={user?.firstName}
          lastName={user?.lastName}
          size="sm"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-900 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-surface-800/50 truncate">{user?.email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-surface-800/60 hover:text-error-600 hover:bg-error-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  </>
);

export default DashboardLayout;
