import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, BookOpen } from 'lucide-react';
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900">Instructor Login</h2>
        </div>
        <p className="text-surface-800/60">Sign in to manage your courses and students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <div>
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
            className="absolute right-3 top-9 text-surface-800/40 hover:text-surface-800/70"
            style={{ position: 'relative', float: 'right', marginTop: '-36px', marginRight: '12px' }}
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Sign In as Instructor
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-50 px-4 text-surface-800/40 uppercase tracking-wider">Or</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-surface-800/60">
        Don&apos;t have an instructor account?{' '}
        <Link to="/instructor/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Register as Instructor
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-surface-800/60">
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          &larr; Back to student login
        </Link>
      </p>
    </motion.div>
  );
};

export default InstructorLoginPage;
