import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || '/';

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const data = await login(form.email, form.password);
      const user = data.data.user;
      toast.success('Welcome back!');

      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'instructor') {
        navigate('/instructor', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-600 mb-5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Student Portal
        </motion.div>
        <h2 className="text-[1.75rem] font-extrabold text-surface-900 tracking-tight">
          Welcome back
        </h2>
        <p className="mt-1.5 text-surface-800/55 text-[0.925rem]">
          Sign in to continue your learning journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            icon={Lock}
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[38px] p-1 rounded-md text-surface-800/30 hover:text-surface-800/60 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-surface-800/55">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full group" size="lg" isLoading={isLoading}>
          Sign In
          {!isLoading && (
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-surface-200/80" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-surface-50 px-4 text-xs text-surface-800/35 uppercase tracking-widest">
            or
          </span>
        </div>
      </div>

      {/* Instructor link card */}
      <Link
        to="/instructor/login"
        className="group flex items-center gap-3.5 p-4 rounded-xl border border-surface-200/60 bg-surface-0 hover:border-brand-200 hover:shadow-card-hover transition-all"
      >
        <div className="p-2.5 rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors">
          <BookOpen className="w-5 h-5 text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-surface-900">Sign in as Instructor</p>
          <p className="text-xs text-surface-800/40">Access your teaching dashboard</p>
        </div>
        <ArrowRight className="w-4 h-4 text-surface-800/25 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
      </Link>

      <p className="mt-7 text-center text-sm text-surface-800/55">
        Don&apos;t have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Sign up for free
        </Link>
      </p>
    </motion.div>
  );
};

export default LoginPage;
