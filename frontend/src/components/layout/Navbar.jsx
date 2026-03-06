import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Bell, Menu, X, ChevronDown,
  BookOpen, GraduationCap, LayoutDashboard, LogOut, User,
  Settings, Heart,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import Avatar from '../ui/Avatar';
import { cn, debounce } from '../../lib/utils';

const navLinks = [
  { to: '/courses', label: 'Browse Courses' },
  { to: '/categories', label: 'Categories' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.items.length);
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const close = () => setProfileOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [profileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'instructor') return '/instructor';
    return '/my-courses';
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass border-b border-surface-200/60 shadow-card'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-brand-text">Zenora</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1 ml-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-surface-800/70 hover:text-surface-900 hover:bg-surface-100'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Search bar — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-md mx-6"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-200 bg-surface-50 
                           text-sm placeholder:text-surface-800/40 focus:outline-none 
                           focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
              />
            </div>
          </form>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="hidden sm:flex p-2 rounded-lg text-surface-800/60 hover:text-surface-900 hover:bg-surface-100 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg text-surface-800/60 hover:text-surface-900 hover:bg-surface-100 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full gradient-brand text-[10px] text-white font-bold flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="hidden sm:flex p-2 rounded-lg text-surface-800/60 hover:text-surface-900 hover:bg-surface-100 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative ml-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileOpen((v) => !v);
                    }}
                    className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-surface-100 transition-colors"
                  >
                    <Avatar
                      src={user?.avatar?.url}
                      firstName={user?.firstName}
                      lastName={user?.lastName}
                      size="sm"
                    />
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-surface-800/50 transition-transform hidden sm:block',
                        profileOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-surface-0 rounded-xl border border-surface-200 shadow-elevated py-1 overflow-hidden"
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-surface-100">
                          <p className="text-sm font-semibold text-surface-900 truncate">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-surface-800/50 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <DropdownLink to={getDashboardLink()} icon={LayoutDashboard}>
                            Dashboard
                          </DropdownLink>
                          <DropdownLink to="/my-courses" icon={BookOpen}>
                            My Learning
                          </DropdownLink>
                          <DropdownLink to="/wishlist" icon={Heart}>
                            Wishlist
                          </DropdownLink>
                          <DropdownLink to="/profile" icon={User}>
                            Profile
                          </DropdownLink>
                          <DropdownLink to="/settings" icon={Settings}>
                            Settings
                          </DropdownLink>
                        </div>

                        <div className="border-t border-surface-100 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-800/80 hover:text-surface-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-brand hover:opacity-90 transition-opacity shadow-glow-brand/30"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu btn */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg text-surface-800/60 hover:bg-surface-100 ml-1"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-surface-200/60 glass"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Mobile search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-800/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-surface-50 text-sm placeholder:text-surface-800/40 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </form>

              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-surface-800/70 hover:bg-surface-100'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 pt-2 border-t border-surface-200/60">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-center text-sm font-medium rounded-xl border border-surface-200 hover:bg-surface-100 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-center text-sm font-semibold text-white rounded-xl gradient-brand"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const DropdownLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2 text-sm text-surface-800/80 hover:bg-surface-50 hover:text-surface-900 transition-colors"
  >
    <Icon className="w-4 h-4" />
    {children}
  </Link>
);

export default Navbar;
