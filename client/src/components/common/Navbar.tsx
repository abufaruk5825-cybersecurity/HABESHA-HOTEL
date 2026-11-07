import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserRole } from '../../types';
import { getDashboardViewForRole } from '../../utils/roleUtils';
import {
  Crown,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Clock,
  Menu,
  X,
  Home,
  BedDouble,
  Utensils,
  BookOpen,
  Coffee,
  Users,
  Camera,
  Mail,
  ChevronDown,
  Info,
  MapPin,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenBookingModal: (roomTypeId?: number) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenBookingModal,
  onOpenAuthModal,
}) => {
  const { user, logout, notifications, unreadCount, markNotificationRead, hotelSettings } = useAuth();
  const { t } = useLanguage();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  // Desktop dropdown state
  const [diningDropdownOpen, setDiningDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileDiningOpen, setMobileDiningOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  const diningDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (diningDropdownRef.current && !diningDropdownRef.current.contains(e.target as Node)) {
        setDiningDropdownOpen(false);
      }
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(e.target as Node)) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll spy to highlight active section on the website
  useEffect(() => {
    if (currentView !== 'website') {
      setActiveSection(currentView);
      return;
    }

    const sectionIds = [
      'rooms',
      'services',
      'food-menu',
      'gallery',
      'staff',
      'reviews',
      'about',
      'contact',
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      if (scrollPosition < 500) {
        setActiveSection('home');
        return;
      }
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const scrollToSection = (sectionId: string) => {
    setDiningDropdownOpen(false);
    setAboutDropdownOpen(false);
    setShowMobileMenu(false);

    if (currentView !== 'website') {
      onNavigate('website');
      setTimeout(() => {
        if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getDashboardView = (role?: string) => getDashboardViewForRole(role);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-900/40 text-slate-100 shadow-xl transition-all">
      {/* Top Micro Info Bar with Global Language Switcher */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs text-slate-400 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('brand.tagline', '5-Star Luxury & Ethiopian Hospitality • Bole, Addis Ababa')}</span>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <a
              href="tel:+251116678000"
              className="hidden md:flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <PhoneCall className="w-3 h-3 text-slate-400" />
              <span>{hotelSettings.hotel_phone || '+251 11 667 8000'}</span>
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px]">
              <Clock className="w-3 h-3 text-amber-400" /> {t('brand.checkin_hours', 'Check-in: 14:00 | Check-out: 11:00')}
            </span>
            <span className="hidden sm:inline text-slate-700">|</span>
            {/* Global Language Selector [ EN | አማርኛ ] */}
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo / Brand Emblem */}
        <button
          onClick={() => scrollToSection('home')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          <img
            src="/images/logo-hotel.png"
            alt="HABESHA-HOTEL Logo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/logo hotel.png';
            }}
            className="h-10 sm:h-11 w-auto object-contain rounded-lg shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-wider text-slate-100 block leading-tight">
              HABESHA<span className="text-amber-400 font-light">-HOTEL</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80 block font-sans">
              Addis Ababa • Ethiopia
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 lg:gap-2 text-xs font-semibold text-slate-300">
          {/* Home */}
          <button
            onClick={() => scrollToSection('home')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'home' && currentView === 'website'
                ? 'text-amber-400 bg-slate-800/80 shadow-sm font-bold'
                : 'hover:text-amber-300 hover:bg-slate-800/40'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t('nav.home', 'Home')}</span>
          </button>

          {/* Rooms & Accommodation */}
          <button
            onClick={() => scrollToSection('rooms')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'rooms' && currentView === 'website'
                ? 'text-amber-400 bg-slate-800/80 shadow-sm font-bold'
                : 'hover:text-amber-300 hover:bg-slate-800/40'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" />
            <span>{t('nav.rooms', 'Rooms & Suites')}</span>
          </button>

          {/* Dining & Cuisine Dropdown */}
          <div className="relative" ref={diningDropdownRef}>
            <button
              onClick={() => setDiningDropdownOpen(!diningDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                (activeSection === 'services' || activeSection === 'food-menu') && currentView === 'website'
                  ? 'text-amber-400 bg-slate-800/80 font-bold'
                  : 'hover:text-amber-300 hover:bg-slate-800/40'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{t('nav.food', 'Food & Dining')}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${diningDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {diningDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => scrollToSection('services')}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                >
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block font-bold">{t('nav.restaurant', 'Food & Restaurant')}</span>
                    <span className="block text-[10px] text-slate-400">Cultural dining & continental dishes</span>
                  </div>
                </button>
                <button
                  onClick={() => scrollToSection('food-menu')}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors border-t border-slate-800/80"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block font-bold">{t('nav.menu', 'Food Menu & Gallery')}</span>
                    <span className="block text-[10px] text-slate-400">All categories, filters & recipes</span>
                  </div>
                </button>
                <button
                  onClick={() => scrollToSection('food-menu')}
                  className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors border-t border-slate-800/80"
                >
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="block font-bold">{t('nav.coffee', 'Coffee Ceremony (Buna)')}</span>
                    <span className="block text-[10px] text-slate-400">Clay Jebena ritual & sweet frankincense</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Hotel Services */}
          <button
            onClick={() => scrollToSection('services')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'services' && currentView === 'website'
                ? 'text-amber-400 bg-slate-800/80 shadow-sm font-bold'
                : 'hover:text-amber-300 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('nav.services', 'Services')}</span>
          </button>

          {/* Staff & Team */}
          <button
            onClick={() => scrollToSection('staff')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'staff' && currentView === 'website'
                ? 'text-amber-400 bg-slate-800/80 shadow-sm font-bold'
                : 'hover:text-amber-300 hover:bg-slate-800/40'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('nav.staff', 'Staff')}</span>
          </button>

          {/* Photo Gallery */}
          <button
            onClick={() => scrollToSection('gallery')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
              activeSection === 'gallery' && currentView === 'website'
                ? 'text-amber-400 bg-slate-800/80 shadow-sm font-bold'
                : 'hover:text-amber-300 hover:bg-slate-800/40'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t('nav.gallery', 'Gallery')}</span>
          </button>

          {/* About & Contact Dropdown */}
          <div className="relative" ref={aboutDropdownRef}>
            <button
              onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                (activeSection === 'about' || activeSection === 'contact' || activeSection === 'reviews') && currentView === 'website'
                  ? 'text-amber-400 bg-slate-800/80 font-bold'
                  : 'hover:text-amber-300 hover:bg-slate-800/40'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t('nav.about_more', 'About & More')}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {aboutDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => scrollToSection('about')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors"
                >
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>{t('nav.about_heritage', 'About Us & Heritage')}</span>
                </button>
                <button
                  onClick={() => scrollToSection('reviews')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors border-t border-slate-800/80"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{t('nav.reviews', 'Guest Reviews')}</span>
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-amber-400 hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors border-t border-slate-800/80"
                >
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>{t('nav.contact', 'Contact & Location')}</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Role Dashboard Quick Link (if user logged in) */}
          {user && (
            <button
              onClick={() => onNavigate(getDashboardView(user.role))}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentView === getDashboardView(user.role)
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-slate-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="capitalize">{t(`role.${user.role}`, user.role)} {t('nav.dashboard', 'Dashboard')}</span>
            </button>
          )}

          {/* Notifications Popover */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors relative cursor-pointer"
                title="Hotel Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-semibold text-xs text-slate-200">
                      System Notifications ({notifications.length})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markNotificationRead('all')}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-lg text-xs border ${
                            n.is_read
                              ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                              : 'bg-slate-800/80 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-amber-300">{n.title}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{n.message}</p>
                          {!n.is_read && (
                            <button
                              onClick={() => markNotificationRead(n.id)}
                              className="mt-1 text-[10px] text-amber-400 hover:underline cursor-pointer"
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Book Room Primary CTA */}
          <button
            onClick={() => onOpenBookingModal()}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 hidden sm:inline" />
            <span>{t('nav.book_now', 'Reservations')}</span>
          </button>

          {/* Account Profile or Sign In */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate(getDashboardView(user.role))}
                className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs overflow-hidden border border-amber-500/30">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.full_name.charAt(0)
                  )}
                </div>
                <span className="font-medium max-w-[90px] truncate">{user.full_name}</span>
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                title={t('nav.logout', 'Sign Out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('nav.login', 'Login / Admin')}</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="xl:hidden p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {showMobileMenu && (
        <div className="xl:hidden bg-slate-950 border-t border-slate-800/90 px-4 py-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4 duration-200">
          {/* Main Links */}
          <div className="space-y-1">
            <button
              onClick={() => scrollToSection('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === 'home' && currentView === 'website' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>{t('nav.home', 'Home')}</span>
            </button>

            <button
              onClick={() => scrollToSection('rooms')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === 'rooms' && currentView === 'website' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BedDouble className="w-4 h-4 text-amber-400" />
              <span>{t('nav.rooms', 'Rooms & Accommodation')}</span>
            </button>

            {/* Mobile Dining Submenu */}
            <div>
              <button
                onClick={() => setMobileDiningOpen(!mobileDiningOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white text-left"
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <span>{t('nav.food', 'Food & Restaurant')}</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileDiningOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileDiningOpen && (
                <div className="ml-7 pl-3 border-l border-slate-800 space-y-1 py-1">
                  <button
                    onClick={() => scrollToSection('services')}
                    className="w-full text-left py-1.5 text-xs text-slate-400 hover:text-amber-300"
                  >
                    • {t('nav.restaurant', 'Restaurant Overview & Hours')}
                  </button>
                  <button
                    onClick={() => scrollToSection('food-menu')}
                    className="w-full text-left py-1.5 text-xs text-slate-400 hover:text-amber-300"
                  >
                    • {t('nav.menu', 'Food Menu & Category Gallery')}
                  </button>
                  <button
                    onClick={() => scrollToSection('food-menu')}
                    className="w-full text-left py-1.5 text-xs text-slate-400 hover:text-amber-300"
                  >
                    • {t('nav.coffee', 'Traditional Coffee Ceremony (Buna)')}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => scrollToSection('services')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === 'services' && currentView === 'website' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('nav.services', 'Hotel Services & Spa')}</span>
            </button>

            <button
              onClick={() => scrollToSection('staff')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === 'staff' && currentView === 'website' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>{t('nav.staff', 'Our Staff & Team')}</span>
            </button>

            <button
              onClick={() => scrollToSection('gallery')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === 'gallery' && currentView === 'website' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span>{t('nav.gallery', 'Hotel Photo Gallery')}</span>
            </button>

            <button
              onClick={() => scrollToSection('about')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === 'about' && currentView === 'website' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 text-amber-400" />
              <span>{t('nav.about', 'About Us')}</span>
            </button>

            <button
              onClick={() => scrollToSection('contact')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors text-left ${
                activeSection === 'contact' && currentView === 'website' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>{t('nav.contact', 'Contact Us')}</span>
            </button>
          </div>

          {/* Quick Action Buttons in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onOpenBookingModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t('nav.book_now', 'Book a Room Now')}</span>
            </button>

            {!user && (
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onOpenAuthModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-xs"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Sign In / Admin Access</span>
              </button>
            )}
          </div>

          {/* Operational Dashboard for Logged-in Staff / Guests */}
          {user && (
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-2">
                {t('nav.dashboard', 'My Active Portal')}
              </span>
              <button
                onClick={() => { onNavigate(getDashboardView(user.role)); setShowMobileMenu(false); }}
                className="w-full p-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 rounded-xl text-xs text-amber-300 font-bold text-left border border-amber-500/30 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span className="capitalize">{t(`role.${user.role}`, user.role)} {t('nav.dashboard', 'Dashboard')}</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-extrabold uppercase">Open</span>
              </button>
            </div>
          )}

          {/* Hotel Location & Direct Contact in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Africa Avenue, Bole Sub-City, Addis Ababa</span>
            </p>
            <p className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <a href="tel:+251116678000" className="hover:text-amber-300">{hotelSettings.hotel_phone || '+251 11 667 8000'}</a>
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
