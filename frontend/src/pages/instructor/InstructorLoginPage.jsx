import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const InstructorLoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

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

      if (user.role !== 'instructor' && user.role !== 'admin') {
        useAuthStore.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        toast.error('Access denied. Instructor account required.');
        return;
      }

      toast.success('Welcome back, Instructor!');
      navigate('/instructor', { replace: true });
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
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-xs font-medium text-accent-700 mb-5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Instructor Portal
        </motion.div>
        <h2 className="text-[1.75rem] font-extrabold text-surface-900 tracking-tight">
          Welcome back, Instructor
        </h2>
        <p className="mt-1.5 text-surface-800/55 text-[0.925rem]">
          Sign in to manage your courses and students
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

        <Button type="submit" className="w-full group" size="lg" isLoading={isLoading}>
          Sign In as Instructor
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

      <p className="text-center text-sm text-surface-800/55">
        Don&apos;t have an instructor account?{' '}
        <Link
          to="/instructor/register"
          className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Register as Instructor
        </Link>
      </p>

      <Link
        to="/login"
        className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-surface-800/40 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to student login
      </Link>
    </motion.div>
  );
};

export default InstructorLoginPage;
