
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Moon, Sun, Bell, LogOut, Crown, ChevronDown,
  LayoutDashboard, User as UserIcon, Settings, ShoppingBag,
  GraduationCap, Briefcase, FileText
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { useRealtimeNotifications } from '../hooks/useRealtime';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsDropdown } from './NotificationsDropdown';
import { PremiumBadge } from './PremiumBadge';

export const Navbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { unreadCount } = useRealtimeNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpportunitiesOpen, setIsOpportunitiesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileOpportunitiesOpen, setIsMobileOpportunitiesOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);

  // Refs for click outside
  const opportunitiesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const opportunitiesLinks = [
    { name: 'Services', path: '/services', icon: ShoppingBag, desc: 'Trouvez des prestataires' },
    { name: 'Formations', path: '/formations', icon: GraduationCap, desc: 'Montez en compétences' },
    { name: 'Emplois', path: '/jobs', icon: Briefcase, desc: 'Décrochez un job' },

  ];

  const isActive = (path: string) => location.pathname === path;
  const isOpportunityActive = opportunitiesLinks.some(link => isActive(link.path));

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (opportunitiesRef.current && !opportunitiesRef.current.contains(event.target as Node)) {
        setIsOpportunitiesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* LEFT: Logo & Desktop Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105 duration-200">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">

              {/* Opportunités Dropdown */}
              <div className="relative" ref={opportunitiesRef}>
                <button
                  onClick={() => setIsOpportunitiesOpen(!isOpportunitiesOpen)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 outline-none group ${isOpportunitiesOpen || isOpportunityActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  Opportunités
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpportunitiesOpen ? 'rotate-180' : 'text-gray-400 group-hover:text-gray-600'}`} />
                </button>

                {/* Rich Dropdown Menu */}
                {isOpportunitiesOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-2">
                      {opportunitiesLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          onClick={() => setIsOpportunitiesOpen(false)}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${isActive(link.path)
                            ? 'bg-primary-50 dark:bg-primary-900/20'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${isActive(link.path) ? 'bg-white dark:bg-gray-800 text-primary-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            <link.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${isActive(link.path) ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                              {link.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{link.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                to="/reseaux"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive('/reseaux')
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                Réseaux
              </Link>
            </div>
          </div>

          {/* CENTER: Global Search (Desktop only) */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-4">
            <GlobalSearch placeholder="Rechercher..." className="w-full" />
          </div>

          {/* RIGHT: Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">

            <Link
              to="/premium"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-500 hover:shadow-md hover:scale-105 transition-all border border-yellow-200 dark:border-yellow-700/50"
            >
              <PremiumBadge size={16} className="mr-1" /> Premium
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
                    className="relative p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white dark:ring-gray-900 px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsPanelOpen && (
                    <NotificationsDropdown
                      isOpen={isNotificationsPanelOpen}
                      onClose={() => setIsNotificationsPanelOpen(false)}
                    />
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                  >
                    <img
                      src={user.avatar?.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${user.avatar}`}
                      alt={user.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                      }}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-sm"
                    />
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-200 border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-gray-400" /> Tableau de bord
                        </Link>
                        <Link to={`/profile/${user._id}`} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <UserIcon className="w-4 h-4 text-gray-400" /> Mon Profil
                        </Link>
                        <Link to="/settings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <Settings className="w-4 h-4 text-gray-400" /> Paramètres
                        </Link>
                      </div>
                      <div className="p-1 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="hidden md:block text-gray-600 dark:text-gray-300 hover:text-primary-600 font-semibold text-sm px-4 py-2 transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary-500/30 transition-all hover:shadow-primary-500/40 hover:-translate-y-0.5">
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-5 duration-200 absolute w-full shadow-2xl z-40 max-h-[calc(100vh-4rem)] overflow-y-auto pb-safe">
          <div className="px-4 pt-4 pb-6 space-y-1">

            {/* Mobile Search */}
            <div className="mb-4">
              <GlobalSearch placeholder="Search..." className="w-full" />
            </div>

            {/* Mobile Opportunities Accordion */}
            <div className="border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">
              <button
                onClick={() => setIsMobileOpportunitiesOpen(!isMobileOpportunitiesOpen)}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-base font-semibold transition-colors ${isOpportunityActive || isMobileOpportunitiesOpen
                  ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                Opportunités <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isMobileOpportunitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMobileOpportunitiesOpen && (
                <div className="mt-1 space-y-1 px-2">
                  {opportunitiesLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                        ? 'text-primary-600 bg-white dark:bg-gray-800 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/reseaux"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Réseaux
            </Link>

            <Link
              to="/premium"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-semibold text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-2"><Crown className="w-5 h-5" /> Premium</div>
            </Link>
          </div>

          <div className="pt-4 pb-8 border-t border-gray-200 dark:border-gray-800 px-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl gap-3">
                  <img className="h-12 w-12 rounded-full object-cover" src={user.avatar} alt="" />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-gray-900 dark:text-white truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 shadow-sm">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl font-medium text-red-600 dark:text-red-400">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-base font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800">
                  Connexion
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block w-full text-center px-4 py-3 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-primary-600 hover:bg-primary-700">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
