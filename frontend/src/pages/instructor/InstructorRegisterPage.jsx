import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900">Become an Instructor</h2>
        </div>
        <p className="text-surface-800/60">Create your instructor account and start teaching</p>
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
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Minimum 8 characters"
          icon={Lock}
          value={form.password}
          onChange={handleChange('password')}
          error={errors.password}
          autoComplete="new-password"
        />

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-xs text-surface-800/50 hover:text-brand-600 transition-colors"
          >
            {showPassword ? 'Hide' : 'Show'} passwords
          </button>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (errors.agreed) setErrors((p) => ({ ...p, agreed: undefined }));
            }}
            className="mt-0.5 w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-surface-800/60">
            I agree to the{' '}
            <Link to="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-brand-600 hover:underline">Instructor Agreement</Link>
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-error-600">{errors.agreed}</p>}

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Create Instructor Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-800/60">
        Already have an instructor account?{' '}
        <Link to="/instructor/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
};

export default InstructorRegisterPage;
