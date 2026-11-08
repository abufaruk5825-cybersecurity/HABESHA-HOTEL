import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, Search, Award, Sparkles, ShieldCheck, Compass, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

// ── Background slide images — all local paths, no external URLs ───────────────
const HERO_SLIDES = [
  { src: '/images/hotel/hero-image.webp',                      fallback: '/images/hotel/hotel-exterior.jpg',           alt: 'HABESHA-HOTEL Luxury Resort & Grand Exterior' },
  { src: '/images/food/classic-doro-wat.jpg',                  fallback: '/images/food/doro-wat.jpg',                  alt: 'Classic Doro Wat — the signature Ethiopian dish' },
  { src: '/images/food/coffee-ceremony.jpg',                   fallback: '/images/food/traditional-coffee-ceremony-experience.jpg', alt: 'Ethiopian coffee ceremony' },
  { src: '/images/food/siga-tibs.jpg',                         fallback: '/images/food/tibs.jpg',                      alt: 'Siga Tibs — pan-seared beef' },
  { src: '/images/food/shiro-tegabino-with-fresh-salad.jpg',   fallback: '/images/food/best-shiro.jpg',                alt: 'Shiro Tegabino with fresh salad' },
  { src: '/images/food/kitfo.jpg',                             fallback: '/images/food/beyeayinet.jpg',                alt: 'Kitfo — Ethiopian minced beef' },
  { src: '/images/food/special-habesha-siga-tibs.jpg',         fallback: '/images/food/tibs-with-atklt.jpg',           alt: 'Special Habesha Tibs' },
  { src: '/images/food/spris-juice.jpg',                       fallback: '/images/food/food-photo.avif',               alt: 'Spris layered juice' },
  { src: '/images/hotel/hotel-exterior.jpg',                   fallback: '/images/hotel/hotel-lobby.jpg',              alt: 'HABESHA-HOTEL exterior' },
];

interface HeroProps {
  onSearchAvailability: (checkIn: string, checkOut: string, guests: number) => void;
  onOpenBookingModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearchAvailability, onOpenBookingModal }) => {
  const { hotelSettings } = useAuth();
  const { t, language } = useLanguage();
  const [showDesc, setShowDesc] = useState(false);

  // ── Background slider state ───────────────────────────────────────────────
  const [heroSlide, setHeroSlide] = useState(0);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    heroTimerRef.current = setInterval(() => {
      setHeroSlide(s => (s + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, []);

  // Default stay: 1 night starting tomorrow (never hardcoded 3 nights)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0]);
  const [guests, setGuests] = useState(2);

  // Auto-advance checkOut if user picks checkIn after current checkOut
  const handleCheckInChange = (newCheckIn: string) => {
    setCheckIn(newCheckIn);
    const inDate = new Date(newCheckIn);
    const outDate = new Date(checkOut);
    if (outDate <= inDate) {
      const nextDay = new Date(inDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  // ── Typewriter effect with bilingual support ──────────────────────────────
  const FULL_TEXT = language === 'am' ? 'እንኳን ወደ ሐበሻ ሆቴል በደህና መጡ' : 'Welcome to HABESHA HOTEL';
  const SPLIT_AT  = language === 'am' ? 'እንኳን ወደ '.length : 'Welcome to '.length;

  const [typed,    setTyped]    = useState('');
  const [erasing,  setErasing]  = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Reset typewriter when language changes
  useEffect(() => {
    setTyped('');
    setErasing(false);
  }, [language]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!erasing) {
      if (typed.length < FULL_TEXT.length) {
        // Typing — random natural speed 60–110 ms per character
        timeout = setTimeout(
          () => setTyped(FULL_TEXT.slice(0, typed.length + 1)),
          60 + Math.random() * 50,
        );
      } else {
        // Fully typed — pause 2.5 s then start erasing
        timeout = setTimeout(() => setErasing(true), 2500);
      }
    } else {
      if (typed.length > 0) {
        // Erasing — slightly faster, 40–70 ms per character
        timeout = setTimeout(
          () => setTyped(FULL_TEXT.slice(0, typed.length - 1)),
          40 + Math.random() * 30,
        );
      } else {
        // Fully erased — pause 600 ms then retype
        timeout = setTimeout(() => setErasing(false), 600);
      }
    }
    return () => clearTimeout(timeout);
  }, [typed, erasing]);

  // Blink cursor every 530 ms
  useEffect(() => {
    const id = setInterval(() => setShowCursor(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Split the typed string into the white prefix and golden suffix
  const whitePart  = typed.slice(0, Math.min(typed.length, SPLIT_AT));
  const goldenPart = typed.length > SPLIT_AT ? typed.slice(SPLIT_AT) : '';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSearchAvailability(checkIn, checkOut, guests);
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── Background Food Image Slider ────────────────────────────────
          Images cycle every 5 s with a cross-fade. All content above
          sits in z-10 on top of this z-0 layer.
      ────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === heroSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              onError={e => { (e.currentTarget as HTMLImageElement).src = slide.fallback; }}
              className={`w-full h-full object-cover object-center transition-all duration-[8000ms] ease-out brightness-[1.12] contrast-[1.08] saturate-[1.15] ${
                i === heroSlide ? 'scale-105' : 'scale-100'
              }`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        {/* Smart luminous overlay: keeps hotel & food images vividly bright while ensuring sharp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050d1a]/90 via-[#050d1a]/30 to-[#050d1a]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(5,13,26,0.45)_100%)] pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-12 sm:pt-20 pb-12 flex-1 flex flex-col justify-center items-center text-center">
        {/* Brand Logo Emblem */}
        <div className="mb-6 flex items-center justify-center">
          <img
            src="/images/logo-hotel.png"
            alt="HABESHA-HOTEL Logo"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png';
            }}
            className="h-16 sm:h-20 md:h-24 w-auto object-contain rounded-2xl shadow-2xl border border-amber-500/40 p-1.5 bg-slate-950/80 backdrop-blur-md hover:scale-105 transition-transform"
          />
        </div>

        {/* Five Star Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/70 border border-amber-400/40 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-5 backdrop-blur-md shadow-lg shadow-black/40">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{t('hero.badge', '5-Star Hotel in Bole, Addis Ababa • Ethiopia')}</span>
        </div>

        {/* Headline — typewriter animation with smart drop shadow */}
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] mb-5 min-h-[1.2em] flex items-center justify-center flex-wrap gap-x-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          {/* White part */}
          {whitePart && (
            <span className="text-white">{whitePart}</span>
          )}
          {/* Golden part */}
          {goldenPart && (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
              {goldenPart}
            </span>
          )}
          {/* Blinking cursor */}
          <span
            className="inline-block w-[3px] h-[0.85em] bg-amber-400 rounded-sm align-middle ml-1"
            style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
          />
        </h1>

        <p className="text-white text-base sm:text-xl font-medium max-w-3xl leading-relaxed mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
          {t('hero.subtitle', 'Enjoy comfortable rooms, delicious Ethiopian food, and friendly service.')}
        </p>

        {/* Toggle description */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <button
            onClick={() => setShowDesc(v => !v)}
            aria-label={showDesc ? t('hero.show_less', 'Hide description') : t('hero.show_more', 'Show description')}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/70 border border-slate-600/60 text-slate-300 hover:bg-amber-500 hover:border-amber-500 hover:text-slate-950 transition-all duration-200 cursor-pointer shadow-lg"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-300 ${showDesc ? 'rotate-180' : ''}`}
            />
          </button>

          {showDesc && (
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-light leading-relaxed text-center animate-in fade-in slide-in-from-top-2 duration-200">
              {t('hero.desc_full', 'Located on Bole Road in Addis Ababa, just 5 minutes from Bole International Airport. Experience traditional Ethiopian coffee ceremonies, relaxing spa treatments, and warm hospitality. We welcome families, business travelers, and international guests.')}
            </p>
          )}
        </div>
        {/* Floating Availability Booking Widget */}
        <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
            {/* Check-in */}
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 focus-within:border-amber-400 transition-colors">
              <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" /> {t('hero.checkin', 'Check-In')}
              </label>
              <input
                type="date"
                required
                value={checkIn}
                onChange={e => handleCheckInChange(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Check-out */}
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 focus-within:border-amber-400 transition-colors">
              <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" /> {t('hero.checkout', 'Check-Out')}
              </label>
              <input
                type="date"
                required
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Guests */}
            <div className="bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 focus-within:border-amber-400 transition-colors">
              <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <Users className="w-3 h-3" /> {t('hero.guests', 'Guests')}
              </label>
              <select
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
                className="w-full bg-transparent text-sm font-semibold text-slate-100 focus:outline-none cursor-pointer"
              >
                <option value={1} className="bg-slate-900 text-white">{t('hero.guest_1', '1 Guest (Solo)')}</option>
                <option value={2} className="bg-slate-900 text-white">{t('hero.guest_2', '2 Guests')}</option>
                <option value={3} className="bg-slate-900 text-white">{t('hero.guest_3', '3 Guests')}</option>
                <option value={4} className="bg-slate-900 text-white">{t('hero.guest_4', '4 Guests (Family)')}</option>
                <option value={5} className="bg-slate-900 text-white">{t('hero.guest_5', '5+ Group')}</option>
              </select>
            </div>

            {/* Submit CTA */}
            <div className="flex items-center">
              <button
                type="submit"
                className="w-full h-full min-h-[50px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold rounded-xl text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{t('hero.search_rooms', 'Search Rooms')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Trust Highlights Bottom Strip */}
      <div className="relative z-10 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">24/7 Front Desk</div>
              <div className="text-[11px] text-slate-400">Warm Ethiopian service</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Best Direct Rates</div>
              <div className="text-[11px] text-slate-400">No hidden fees</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Heart of Addis Ababa</div>
              <div className="text-[11px] text-slate-400">Bole Road, Africa Avenue</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">Airport Pickup Shuttle</div>
              <div className="text-[11px] text-slate-400">5 min from Bole Airport</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
