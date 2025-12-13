

import React, { useState, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Logo } from './components/Logo';
import { AuthGuard } from './components/AuthGuard';
import { ScrollToTop } from './components/ScrollToTop';

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Services = lazy(() => import('./pages/Services'));
const Formations = lazy(() => import('./pages/Formations'));
const Jobs = lazy(() => import('./pages/Jobs'));
const CreateJob = lazy(() => import('./pages/CreateJob').then(module => ({ default: module.CreateJob })));
const CVBuilder = lazy(() => import('./pages/CVBuilder').then(module => ({ default: module.CVBuilder })));
const Order = lazy(() => import('./pages/Order'));
const Premium = lazy(() => import('./pages/Premium'));
const SocialNetwork = lazy(() => import('./pages/SocialNetwork'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const About = lazy(() => import('./pages/About'));
const Careers = lazy(() => import('./pages/Careers'));
const Blog = lazy(() => import('./pages/Blog'));
const Partners = lazy(() => import('./pages/Partners'));
const Contact = lazy(() => import('./pages/Contact'));
const Legal = lazy(() => import('./pages/Legal'));
const MyItems = lazy(() => import('./pages/MyItems'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const Billing = lazy(() => import('./pages/Billing'));
const Settings = lazy(() => import('./pages/Settings'));
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));

import { Facebook, Twitter, Linkedin, Instagram, Mail, ArrowRight, Heart, Check } from 'lucide-react';

import { TourOverlay } from './components/onboarding/TourOverlay';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <TourOverlay />
      <main className="flex-grow flex flex-col w-full">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal" element={<Legal />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/services" element={<AuthGuard><Services /></AuthGuard>} />
            <Route path="/formations" element={<AuthGuard><Formations /></AuthGuard>} />
            <Route path="/jobs" element={<AuthGuard><Jobs /></AuthGuard>} />
            <Route path="/jobs/create" element={<AuthGuard><CreateJob /></AuthGuard>} />
            <Route path="/cv-builder" element={<AuthGuard><CVBuilder /></AuthGuard>} />
            <Route path="/premium" element={<AuthGuard><Premium /></AuthGuard>} />
            <Route path="/reseaux" element={<AuthGuard><SocialNetwork /></AuthGuard>} />
            <Route path="/profile/:userId" element={<AuthGuard><UserProfile /></AuthGuard>} />
            <Route path="/order/:serviceId" element={<AuthGuard><Order /></AuthGuard>} />

            {/* Dashboard Sub-Routes */}
            <Route path="/my-items" element={<AuthGuard><MyItems /></AuthGuard>} />
            <Route path="/messages" element={<AuthGuard><MessagesPage /></AuthGuard>} />
            <Route path="/billing" element={<AuthGuard><Billing /></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><Settings /></AuthGuard>} />

            {/* SUPER ADMIN ROUTES */}
            <Route path="/super-admin" element={<SuperAdminLogin />} />
            <Route path="/admin-dashboard" element={<SuperAdminDashboard />} />

            {/* Legacy/Redirect support */}
            <Route path="/forum" element={<AuthGuard><SocialNetwork /></AuthGuard>} />
          </Routes>
        </Suspense>
      </main>

      {/* Modern Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-20 pb-8 transition-colors duration-300">
        {/* Pre-Footer Call to Action - Hidden for logged-in users */}
        {!user && (
          <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10 mb-6 md:mb-0 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Prêt à booster votre carrière ?</h3>
                <p className="text-primary-100 text-lg">Rejoignez plus de 10,000 professionnels et entreprises aujourd'hui.</p>
              </div>
              <div className="relative z-10 flex gap-4">
                <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-50 font-bold py-3.5 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              La plateforme de référence connectant talents, entreprises et opportunités à travers l'Afrique. Construisons l'avenir ensemble.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-primary-500 hover:text-white hover:border-primary-500 dark:hover:bg-primary-500 transition-all duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Plateforme</h3>
            <ul className="space-y-4 text-sm">
              {[
                { label: 'Trouver un Service', path: '/services' },
                { label: 'Offres d\'Emploi', path: '/jobs' },
                { label: 'Formations', path: '/formations' },
                { label: 'Réseau Professionnel', path: '/reseaux' },
                { label: 'Offres Premium', path: '/premium' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-primary-500 transition-colors"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Entreprise</h3>
            <ul className="space-y-4 text-sm">
              {[
                { label: 'À propos de nous', path: '/about' },
                { label: 'Carrières', path: '/careers' },
                { label: 'Blog & Actualités', path: '/blog' },
                { label: 'Partenaires', path: '/partners' },
                { label: 'Contact', path: '/contact' }
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-gray-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Newsletter</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
              Recevez les dernières opportunités et actualités directement dans votre boîte mail. Pas de spam.
            </p>
            {newsletterSubscribed ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm flex items-center gap-2 animate-in fade-in">
                <Check className="w-5 h-5" /> Inscrit avec succès !
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all"
                  />
                </div>
                <button type="submit" className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-primary-600 dark:hover:bg-primary-600 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-500/25">
                  S'abonner <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-xs text-center md:text-left">
              &copy; {new Date().getFullYear()} JOM Solution. Tous droits réservés.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <span>Fait avec</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-current animate-pulse" />
              <span>pour l'Afrique</span>
            </div>

            <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400 font-medium">
              <Link to="/legal" className="hover:text-gray-900 dark:hover:text-white transition-colors">Conditions</Link>
              <Link to="/legal" className="hover:text-gray-900 dark:hover:text-white transition-colors">Confidentialité</Link>
              <Link to="/legal" className="hover:text-gray-900 dark:hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <MainLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
