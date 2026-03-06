import { Outlet } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-12">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Zenora</span>
          </Link>

          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
            Transform your future with world-class learning
          </h1>
          <p className="text-lg text-brand-200/80 leading-relaxed">
            Join thousands of learners advancing their careers with expert-led courses.
          </p>

          {/* Stats */}
          <div className="mt-10 flex items-center justify-center gap-8">
            <StatBubble value="10K+" label="Students" />
            <StatBubble value="500+" label="Courses" />
            <StatBubble value="100+" label="Instructors" />
          </div>
        </div>
      </div>

      {/* Right — form area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-brand-text">Zenora</span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

const StatBubble = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-sm text-brand-200/60">{label}</p>
  </div>
);

export default AuthLayout;
