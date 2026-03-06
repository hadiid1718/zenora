import { Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Sparkles, BookOpen, Users, Award, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const floatingVariants = {
  animate: (i) => ({
    y: [0, -12, 0],
    rotate: [0, i % 2 === 0 ? 6 : -6, 0],
    transition: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
  }),
};

const panels = {
  student: {
    headline: 'Learn without limits',
    sub: 'Unlock your potential with expert-led courses designed for the future.',
    features: [
      { icon: Play, text: 'HD video lessons' },
      { icon: Award, text: 'Earn certificates' },
      { icon: Users, text: 'Join 10 K+ learners' },
    ],
  },
  instructor: {
    headline: 'Inspire the world',
    sub: 'Share your expertise, build your audience, and earn on your own terms.',
    features: [
      { icon: BookOpen, text: 'Create rich courses' },
      { icon: Users, text: 'Reach global students' },
      { icon: Sparkles, text: 'AI-powered insights' },
    ],
  },
};

const AuthLayout = () => {
  const { pathname } = useLocation();
  const isInstructor = pathname.startsWith('/instructor');
  const panel = isInstructor ? panels.instructor : panels.student;

  return (
    <div className="min-h-screen flex bg-surface-50">
      {/* Left — immersive brand panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Gradient base */}
        <div className="absolute inset-0 gradient-hero" />

        {/* Mesh / glow blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-24 -left-24 w-120 h-120 rounded-full bg-brand-500/15 blur-[100px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-105 h-105 rounded-full bg-accent-400/15 blur-[100px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-85 h-85 rounded-full bg-brand-300/10 blur-[80px]"
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Floating icon badges */}
        {[BookOpen, Award, Sparkles, Users].map((Icon, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingVariants}
            animate="animate"
            className="absolute w-12 h-12 rounded-2xl bg-white/[0.07] backdrop-blur-sm border border-white/10 flex items-center justify-center"
            style={{
              top: `${18 + i * 18}%`,
              left: i % 2 === 0 ? '8%' : '82%',
            }}
          >
            <Icon className="w-5 h-5 text-white/50" />
          </motion.div>
        ))}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-14">
          <Link to="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg group-hover:bg-white/15 transition-colors">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">Zenora</span>
          </Link>

          <motion.h1
            key={panel.headline}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-[2.75rem] font-extrabold text-white text-center leading-tight max-w-md"
          >
            {panel.headline}
          </motion.h1>

          <motion.p
            key={panel.sub}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-brand-200/70 text-center max-w-sm leading-relaxed"
          >
            {panel.sub}
          </motion.p>

          {/* Feature pills */}
          <motion.div
            key={isInstructor ? 'i' : 's'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap justify-center gap-3"
          >
            {panel.features.map(({ icon: FIcon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 text-sm text-white/80"
              >
                <FIcon className="w-4 h-4 text-accent-300" />
                {text}
              </span>
            ))}
          </motion.div>

          {/* Testimonial card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 max-w-sm w-full bg-white/6 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
          >
            <p className="text-sm text-white/70 italic leading-relaxed">
              &ldquo;Zenora changed the trajectory of my career. The courses are world-class and
              the community is incredibly supportive.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-brand-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">Alex Rivera</p>
                <p className="text-xs text-white/40">Full-Stack Developer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right — form area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        {/* Subtle background accents on form side */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-100/40 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent-100/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-110 relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-md">
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

export default AuthLayout;
