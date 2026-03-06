import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Youtube, Mail } from 'lucide-react';

const footerSections = [
  {
    title: 'Explore',
    links: [
      { to: '/courses', label: 'All Courses' },
      { to: '/categories', label: 'Categories' },
      { to: '/courses?sort=popular', label: 'Popular' },
      { to: '/courses?sort=newest', label: 'New Releases' },
    ],
  },
  {
    title: 'Teach',
    links: [
      { to: '/teach', label: 'Become an Instructor' },
      { to: '/instructor', label: 'Instructor Dashboard' },
      { to: '/help/instructor', label: 'Teaching Resources' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact' },
      { to: '/careers', label: 'Careers' },
      { to: '/blog', label: 'Blog' },
    ],
  },
  {
    title: 'Support',
    links: [
      { to: '/help', label: 'Help Center' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
      { to: '/refund', label: 'Refund Policy' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-surface-900 text-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Zenora</span>
            </Link>
            <p className="text-sm text-surface-200/60 leading-relaxed mb-6 max-w-xs">
              Empowering learners worldwide with premium courses from expert instructors.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink href="#" icon={Twitter} label="Twitter" />
              <SocialLink href="#" icon={Youtube} label="YouTube" />
              <SocialLink href="#" icon={Github} label="GitHub" />
              <SocialLink href="#" icon={Mail} label="Email" />
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-surface-200/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-200/40">
            &copy; {new Date().getFullYear()} Zenora. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-surface-200/40 hover:text-surface-200/80 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-surface-200/40 hover:text-surface-200/80 transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-xs text-surface-200/40 hover:text-surface-200/80 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon: Icon, label }) => (
  <a
    href={href}
    aria-label={label}
    className="p-2 rounded-lg bg-surface-800 text-surface-200/60 hover:text-white hover:bg-surface-800/80 transition-colors"
  >
    <Icon className="w-4 h-4" />
  </a>
);

export default Footer;
