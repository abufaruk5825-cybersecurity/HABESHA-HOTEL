import React, { useState } from 'react';
import {
  Camera,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GalleryImage {
  id: string;
  title: string;
  category: 'hotel' | 'rooms' | 'dining' | 'coffee' | 'wellness';
  categoryLabel: string;
  image: string;
  description: string;
}

export const GALLERY_DATA: GalleryImage[] = [
  // ── HOTEL & ARCHITECTURE ────────────────────────────────────────────────
  {
    id: 'hotel-exterior',
    title: 'HABESHA-HOTEL Bole Exterior Facade',
    category: 'hotel',
    categoryLabel: 'Hotel & Architecture',
    image: '/images/hotel/hotel-exterior.jpg',
    description: 'Our modern 5-star hotel building illuminated along Africa Avenue (Bole Road), just 5 minutes from Addis Ababa Bole International Airport.',
  },
  {
    id: 'hotel-lobby',
    title: 'Grand Reception Lobby & Chandelier',
    category: 'hotel',
    categoryLabel: 'Hotel & Architecture',
    image: '/images/hotel/hotel-lobby.jpg',
    description: 'Italian polished marble floors, sparkling chandeliers, and warm Habesha concierge reception welcoming guests 24 hours a day.',
  },
  {
    id: 'suite-interior',
    title: 'Luxury Suite Living Room & Skyline View',
    category: 'hotel',
    categoryLabel: 'Hotel & Architecture',
    image: '/images/hotel/suite-interior.jpg',
    description: 'Elegantly furnished living salon featuring panoramic city skyline views of Bole, hardwood floors, and artisan Ethiopian decor.',
  },

  // ── ROOMS & SUITES ──────────────────────────────────────────────────────
  {
    id: 'deluxe-king',
    title: 'Deluxe King Room with City View',
    category: 'rooms',
    categoryLabel: 'Rooms & Suites',
    image: '/images/rooms/deluxe-king.jpg',
    description: 'Spacious king-size bed with floor-to-ceiling windows, ergonomic work desk, high-speed Wi-Fi, and rainfall shower.',
  },
  {
    id: 'twin-deluxe',
    title: 'Twin Deluxe Room (Two Separate Beds)',
    category: 'rooms',
    categoryLabel: 'Rooms & Suites',
    image: '/images/rooms/twin-deluxe.jpg',
    description: 'Designed specifically with two separate plush single beds, perfect for colleagues, delegates, or traveling friends.',
  },
  {
    id: 'family-suite',
    title: 'Family Grand Two-Bedroom Suite',
    category: 'rooms',
    categoryLabel: 'Rooms & Suites',
    image: '/images/rooms/family-suite.jpg',
    description: 'Spacious family accommodations featuring two queen beds, children lounge area, and double vanities.',
  },
  {
    id: 'presidential-suite',
    title: 'Presidential Penthouse Suite',
    category: 'rooms',
    categoryLabel: 'Rooms & Suites',
    image: '/images/rooms/presidential-suite.jpg',
    description: 'Our premier luxury penthouse with 360-degree terrace views of Addis Ababa, private dining room, and dedicated butler service.',
  },
  {
    id: 'standard-single',
    title: 'Standard Single Business Room',
    category: 'rooms',
    categoryLabel: 'Rooms & Suites',
    image: '/images/rooms/standard-single.jpg',
    description: 'Cozy, quiet room with ergonomic desk, fast Wi-Fi, and peaceful courtyard views for the solo business traveler.',
  },

  // ── CULTURAL DINING ─────────────────────────────────────────────────────
  {
    id: 'doro-wat-gallery',
    title: 'Authentic Doro Wat Served in Mesob',
    category: 'dining',
    categoryLabel: 'Traditional Dining',
    image: '/images/food/doro-wat.jpg',
    description: 'Slow-simmered tender chicken drumstick in fragrant berbere stew, boiled egg, cottage cheese, and sourdough teff injera.',
  },
  {
    id: 'siga-tibs-gallery',
    title: 'Sizzling Habesha Siga Tibs on Clay Burner',
    category: 'dining',
    categoryLabel: 'Traditional Dining',
    image: '/images/food/siga-tibs.jpg',
    description: 'Tender cubed beef sautéed with fresh rosemary, garlic, and onions, served sizzling hot on traditional charcoal clay burner with Awaze.',
  },
  {
    id: 'shiro-tegabino-gallery',
    title: 'Clay Pot Shiro Tegabino with Fresh Salad',
    category: 'dining',
    categoryLabel: 'Traditional Dining',
    image: '/images/food/shiro-tegabino.jpg',
    description: 'Aromatic spiced chickpea stew bubbling hot in a clay pot, accompanied by fresh tomato salad and warm injera.',
  },
  {
    id: 'kitfo-gallery',
    title: 'Gurage Kitfo with Ayib & Gomen',
    category: 'dining',
    categoryLabel: 'Traditional Dining',
    image: '/images/food/kitfo.jpg',
    description: 'Minced lean beef warmed in spiced clarified butter (Niter Kibbeh) with Mitmita, seasoned collard greens, and Ayib.',
  },
  {
    id: 'beyeayinet-gallery',
    title: 'Colorful Fasting Beyaynetu Veggie Platter',
    category: 'dining',
    categoryLabel: 'Traditional Dining',
    image: '/images/food/beyeayinet.jpg',
    description: 'Artisan assortment of Ethiopian vegetarian and vegan stews served over iron-rich brown teff injera.',
  },

  // ── COFFEE CEREMONY & DRINKS ───────────────────────────────────────────
  {
    id: 'coffee-ceremony-gallery',
    title: 'Traditional Ethiopian Buna Coffee Ceremony',
    category: 'coffee',
    categoryLabel: 'Coffee & Drinks',
    image: '/images/food/coffee-ceremony.jpg',
    description: 'Hand-roasted single-origin Arabica coffee brewed in a traditional black clay Jebena, served with smoking frankincense and popcorn.',
  },
  {
    id: 'ethiopian-tej-gallery',
    title: 'Pure Ethiopian Tej in Berele Glass Flask',
    category: 'coffee',
    categoryLabel: 'Coffee & Drinks',
    image: '/images/food/ethiopian-tej.jpg',
    description: 'Ancient royal honey wine crafted from natural mountain forest honey and Gesho, served chilled in traditional Berele glassware.',
  },
  {
    id: 'spris-juice-gallery',
    title: 'Layered Tropical Avocado & Mango Spris',
    category: 'coffee',
    categoryLabel: 'Coffee & Drinks',
    image: '/images/food/spris-juice.jpg',
    description: 'Freshly blended layers of rich avocado, ripe Harar mango, and sweet papaya smoothie with fresh lime.',
  },

  // ── WELLNESS & AMENITIES ───────────────────────────────────────────────
  {
    id: 'spa-massage-gallery',
    title: 'Eucalyptus Herbal Steam Spa & Massage',
    category: 'wellness',
    categoryLabel: 'Wellness & Amenities',
    image: '/images/services/spa-massage.jpg',
    description: 'Natural eucalyptus herbal steam bath, dry Finnish sauna, and Swedish full-body relaxation therapy rooms.',
  },
  {
    id: 'airport-shuttle-gallery',
    title: 'Bole Airport Private Transfer Shuttle',
    category: 'wellness',
    categoryLabel: 'Wellness & Amenities',
    image: '/images/services/airport-shuttle.jpg',
    description: 'Air-conditioned Mercedes-Benz Sprinter luxury shuttle providing complimentary guest transfers to and from Bole International Airport.',
  },
  {
    id: 'conference-hall-gallery',
    title: 'Executive Conference & Banquet Hall',
    category: 'wellness',
    categoryLabel: 'Wellness & Amenities',
    image: '/images/services/conference-hall.jpg',
    description: 'High-speed Wi-Fi equipped conference hall with HD projectors, conference acoustics, and dedicated banquet catering.',
  },
];

export const GallerySection: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const tabs = [
    { id: 'all', label: t('gallery.filter_all', 'All Photos'), count: GALLERY_DATA.length },
    { id: 'hotel', label: t('gallery.filter_hotel', 'Hotel & Architecture'), count: GALLERY_DATA.filter(g => g.category === 'hotel').length },
    { id: 'rooms', label: t('gallery.filter_rooms', 'Rooms & Suites'), count: GALLERY_DATA.filter(g => g.category === 'rooms').length },
    { id: 'dining', label: t('gallery.filter_dining', 'Traditional Dining'), count: GALLERY_DATA.filter(g => g.category === 'dining').length },
    { id: 'coffee', label: t('gallery.filter_coffee', 'Coffee & Drinks'), count: GALLERY_DATA.filter(g => g.category === 'coffee').length },
    { id: 'wellness', label: t('gallery.filter_wellness', 'Wellness & Amenities'), count: GALLERY_DATA.filter(g => g.category === 'wellness').length },
  ];

  const filtered = activeTab === 'all'
    ? GALLERY_DATA
    : GALLERY_DATA.filter(g => g.category === activeTab);

  const initialLimit = 6;
  const displayed = showAll ? filtered : filtered.slice(0, initialLimit);
  const hasMore = filtered.length > initialLimit;

  const currentLightbox = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filtered.length);
    }
  };

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filtered.length) % filtered.length);
    }
  };

  return (
    <section id="gallery" className="py-24 bg-slate-950 text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Camera className="w-3.5 h-3.5" /> {t('gallery.badge', 'Visual Showcase • የሆቴሉ ገፅታዎች')}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            {t('gallery.title', 'Hotel & Cultural Experience Gallery')}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
            {t('gallery.subtitle', 'Take a visual tour through our welcoming Bole hotel exterior, luxurious suites, authentic clay pot cuisine, and traditional coffee ceremonies that welcome guests to Addis Ababa.')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowAll(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(idx)}
              className="group relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 shadow-xl cursor-pointer"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/hotel/hotel-exterior.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Top Category Badge */}
              <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                {item.categoryLabel}
              </span>

              {/* Zoom Icon Button */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 group-hover:text-amber-400 flex items-center justify-center border border-slate-700 group-hover:border-amber-500/50 transition-colors">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
                <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors drop-shadow">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-xs font-light line-clamp-2 leading-relaxed drop-shadow">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View More / Show Less Button */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 hover:border-amber-400 text-xs sm:text-sm font-bold tracking-wider transition-all shadow-xl hover:shadow-amber-500/10 cursor-pointer"
            >
              <span>{showAll ? t('gallery.show_less', 'Show Fewer Photos') : (language === 'am' ? `ተጨማሪ ፎቶዎችን እይ (${filtered.length - initialLimit})` : `View More Photos (${filtered.length - initialLimit} more)`)}</span>
              {showAll ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {currentLightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center border border-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Modal Container */}
          <div className="relative max-w-4xl w-full bg-slate-950 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="relative max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={currentLightbox.image}
                alt={currentLightbox.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/hotel/hotel-exterior.jpg';
                }}
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  {currentLightbox.categoryLabel}
                </span>
                <h3 className="font-serif text-xl font-bold text-white">
                  {currentLightbox.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl font-light leading-relaxed">
                  {currentLightbox.description}
                </p>
              </div>

              <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
                {(lightboxIndex ?? 0) + 1} / {filtered.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

