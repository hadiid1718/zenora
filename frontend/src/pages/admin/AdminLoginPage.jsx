import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
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

      if (user.role !== 'admin') {
        useAuthStore.setState({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
        toast.error('Access denied. Admin credentials required.');
        return;
      }

      toast.success('Welcome back, Admin!');
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-lg border border-surface-200 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900">Admin Panel</h2>
            <p className="text-surface-800/60 mt-1">Sign in to the administration dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@zenora.com"
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
                placeholder="Enter admin password"
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
              Sign In as Admin
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-800/60">
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              &larr; Back to main login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
