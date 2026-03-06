import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, BookOpen, ArrowRight,
  CheckCircle2, DollarSign, BarChart3, Users,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const passwordChecks = [
  { test: (v) => v.length >= 8, label: '8+ characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'Uppercase letter' },
  { test: (v) => /\d/.test(v), label: 'Number' },
];

const perks = [
  { icon: BarChart3, text: 'Detailed analytics dashboard' },
  { icon: DollarSign, text: 'Competitive revenue share' },
  { icon: Users, text: 'Reach a global audience' },
];

const InstructorRegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!agreed) errs.agreed = 'You must accept the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: 'instructor',
      });
      toast.success('Instructor account created successfully!');
      navigate('/instructor', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
      <div className="mb-7">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-50 border border-accent-100 text-xs font-medium text-accent-700 mb-5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Become an Instructor
        </motion.div>
        <h2 className="text-[1.75rem] font-extrabold text-surface-900 tracking-tight">
          Start teaching today
        </h2>
        <p className="mt-1.5 text-surface-800/55 text-[0.925rem]">
          Share your expertise and earn from your knowledge
        </p>
      </div>

      {/* Perks */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {perks.map(({ icon: PIcon, text }) => (
          <div
            key={text}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-0 border border-surface-200/60 text-center"
          >
            <div className="p-2 rounded-lg bg-brand-50">
              <PIcon className="w-4 h-4 text-brand-600" />
            </div>
            <span className="text-[0.7rem] leading-tight text-surface-800/50 font-medium">{text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            icon={User}
            value={form.firstName}
            onChange={handleChange('firstName')}
            error={errors.firstName}
            autoComplete="given-name"
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            icon={User}
            value={form.lastName}
            onChange={handleChange('lastName')}
            error={errors.lastName}
            autoComplete="family-name"
          />
        </div>

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
            placeholder="Create a strong password"
            icon={Lock}
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-9.5 p-1 rounded-md text-surface-800/30 hover:text-surface-800/60 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password strength */}
        {form.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-2"
          >
            {passwordChecks.map(({ test, label }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${
                  test(form.password)
                    ? 'bg-success-50 text-success-600'
                    : 'bg-surface-100 text-surface-800/35'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {label}
              </span>
            ))}
          </motion.div>
        )}

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          icon={Lock}
          value={form.confirmPassword}
          onChange={handleChange('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (errors.agreed) setErrors((p) => ({ ...p, agreed: undefined }));
            }}
            className="mt-0.5 w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-surface-800/55 leading-snug">
            I agree to the{' '}
            <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-brand-600 hover:underline">Instructor Agreement</Link>
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-error-600 -mt-1">{errors.agreed}</p>}

        <Button type="submit" className="w-full group" size="lg" isLoading={isLoading}>
          Create Instructor Account
          {!isLoading && (
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-surface-800/55">
        Already have an instructor account?{' '}
        <Link
          to="/instructor/login"
          className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default InstructorRegisterPage;
