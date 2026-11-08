import React from 'react';
import {
  X, Crown, Coffee, Utensils, BedDouble, MapPin, Sparkles,
  ShieldCheck, Heart, Navigation, ExternalLink, CalendarCheck, Compass
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AboutHeritageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking?: () => void;
  onOpenContact?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const AboutHeritageModal: React.FC<AboutHeritageModalProps> = ({
  isOpen,
  onClose,
  onOpenBooking,
  onOpenContact,
  onScrollToSection,
}) => {
  const { t, language } = useLanguage();

  if (!isOpen) return null;

  const handleScrollAndClose = (sectionId: string) => {
    onClose();
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-hotel.png"
              alt="HABESHA-HOTEL Logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/logo hotel.png';
              }}
              className="h-9 w-auto object-contain rounded-lg border border-amber-500/30 bg-slate-900 p-1"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
                  HABESHA<span className="text-amber-400 font-light">-HOTEL</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{language === 'am' ? 'የሆቴሉ ታሪክና ባህላዊ ቅርስ' : 'About Us & Ethiopian Heritage'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'am'
                  ? 'እውነተኛ የኢትዮጵያ መስተንግዶ እና 5-ኮከብ ዘመናዊ ቅንጦት በቦሌ፣ አዲስ አበባ'
                  : 'Authentic Ethiopian Hospitality & 5-Star Luxury in Bole, Addis Ababa'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScrollAndClose('about')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs text-amber-400 border border-amber-500/30 transition-colors"
              title="View on page"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{language === 'am' ? 'በድረ-ገጹ ላይ ይመልከቱ' : 'View on Page'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1 text-slate-200">

          {/* Hero Story Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'am' ? 'ታሪካችንና ራዕያችን' : 'Our Story & Heritage'}</span>
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                {language === 'am'
                  ? 'የኢትዮጵያ ሞቅ ያለ የእንግዳ ተቀባይነት ባህል ከዘመናዊ የሆቴል ቅንጦት ጋር'
                  : 'Where Ethiopian Heritage Meets 5-Star Modern Hospitality'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                {language === 'am'
                  ? 'በአዲስ አበባ ቦሌ አፍሪካ ጎዳና ላይ የሚገኘው ሐበሻ ሆቴል፣ በታመነ የሀበሻ መስተንግዶ ላይ የተገነባ ሰላማዊና ዘመናዊ የሆቴል ቆይታን ያቀርባል። ከቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ በ5 ደቂቃ ርቀት ላይ የሚገኝ ሲሆን፣ ዓለም አቀፍ ዲፕሎማቶችን፣ ነጋዴዎችን እና ቤተሰቦችን በታላቅ ክብር እናስተናግዳለን።'
                  : 'Located on Africa Avenue in Bole, Addis Ababa, HABESHA-HOTEL blends the timeless warmth of authentic Ethiopian hospitality with the highest standards of international luxury. Just 5 minutes from Bole International Airport, we offer an unforgettable sanctuary for business executives, diplomats, and international travelers.'}
              </p>
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
              <img
                src="/images/hotel/suite-interior.jpg"
                alt="HABESHA-HOTEL interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 4 Cultural & Service Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Coffee Ceremony */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">
                    {language === 'am' ? 'ባህላዊ የቡና ሥነ-ሥርዓት (ቡና ጠጡ)' : 'Traditional Buna Ceremony'}
                  </h4>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {language === 'am' ? 'የሸክላ ጀበና፣ ዕጣንና ፈንድሻ' : 'Clay Jebena, Sweet Frankincense & Fresh Popcorn'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {language === 'am'
                  ? 'ኢትዮጵያ የቡና መገኛ ምድር እንደመሆኗ መጠን፣ በየዕለቱ ትኩስ የተቆላ የሐረርና ሲዳማ ቡና በሸክላ ጀበና ተፈልቶ ከጥዑም ዕጣን ጢስና ፈንድሻ ጋር ለእንግዶቻችን በነፃ ይቀርባል።'
                  : 'Experience the birthplace of coffee with our daily ritual. Fresh organic highland coffee roasted in front of you, served in traditional clay Jebenas with smoking frankincense and golden popcorn.'}
              </p>
            </div>

            {/* 2. Habesha Cultural Dining */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">
                    {language === 'am' ? 'የሐበሻ ባህላዊና ዓለም አቀፍ ምግብ' : 'Authentic Habesha & Continental Cuisine'}
                  </h4>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {language === 'am' ? 'ዶሮ ወጥ፣ የሸክላ ሽሮ፣ ስጋ ጥብስና ጠጅ' : 'Doro Wat, Siga Tibs, Shiro Tegabino & Tej'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {language === 'am'
                  ? 'የእኛ ሬስቶራንት ልዩ የዶሮ ወጥ፣ የበሬ ጥብስ፣ የተልባና የሽሮ ተጋቢኖ እንዲሁም የዓለም አቀፍ ምግቦችና የተፈጥሮ የፍራፍሬ ጭማቂዎችን በከፍተኛ ጥራት ያዘጋጃል።'
                  : 'Delight in master-crafted Ethiopian national dishes including slow-simmered Doro Wat, sizzling beef Tibs, clay pot Shiro, vegetarian platters, and international favorites.'}
              </p>
            </div>

            {/* 3. Modern Luxury Suites */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">
                    {language === 'am' ? '18+ ዘመናዊ የቅንጦት ክፍሎችና ስዊቶች' : '18+ Modern Luxury Suites'}
                  </h4>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {language === 'am' ? 'ፈጣን ፋይበር ኢንተርኔት፣ የሞቀ ውሃና ስፓ' : 'High-Speed Wi-Fi, Rainfall Showers & Steam Spa'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {language === 'am'
                  ? 'ከስታንዳርድ ነጠላ ክፍሎች እስከ ፕሬዝዳንሻል ስዊቶች ድረስ በኤሌክትሮኒክስ መክፈቻ፣ ምቹ ፍራሽ፣ የ24-ሰዓት ክፍል ውስጥ አገልግሎትና የአየር ማቀዝቀዣ የተገጠመላቸው ክፍሎች።'
                  : 'From Standard Deluxe rooms to the Presidential Penthouse, every accommodation features electronic RFID keycards, ergonomic desks, rainfall showers, and eucalyptus steam therapy.'}
              </p>
            </div>

            {/* 4. Strategic Location */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white">
                    {language === 'am' ? 'ስትራቴጂካዊ የቦሌ መገኛ' : 'Strategic Bole Location'}
                  </h4>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {language === 'am' ? 'ከአየር ማረፊያ በ5 ደቂቃ ርቀት ላይ' : '5 Minutes from Bole Airport with Free Shuttle'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {language === 'am'
                  ? 'በቦሌ አፍሪካ ጎዳና ላይ ከሚሌኒየም አዳራሽ፣ ከዓለም አቀፍ ኤምባሲዎች እና ከንግድ ማዕከላት አቅራቢያ የሚገኝ ሲሆን፣ የ24-ሰዓት ነፃ የአየር ማረፊያ ማመላለሻ አገልግሎት አለን።'
                  : 'Positioned on prestigious Africa Avenue in Bole, walking distance to Millennium Hall, diplomatic embassies, and luxury shopping, with complimentary 24/7 airport transfers.'}
              </p>
            </div>
          </div>

          {/* Fast Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">18+</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {language === 'am' ? 'ዘመናዊ ስዊቶች' : 'Luxury Suites'}
              </span>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">5 Min</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {language === 'am' ? 'ከቦሌ አየር ማረፊያ' : 'From Bole Airport'}
              </span>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">24/7</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {language === 'am' ? 'የእንግዳ አገልግሎት' : 'Concierge & Reception'}
              </span>
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">100%</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {language === 'am' ? 'እውነተኛ የሐበሻ መስተንግዶ' : 'Ethiopian Hospitality'}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenBooking && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ክፍል ያስይዙ' : 'Book a Room Now'}</span>
              </button>
            )}

            {onOpenContact && (
              <button
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'am' ? 'የሆቴሉ መገኛና ካርታ' : 'View Location & Map'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScrollAndClose('about')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline"
            >
              {language === 'am' ? 'ወደ ድረ-ገጹ ክፍል ውረድ' : 'Scroll to Page Section'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              {language === 'am' ? 'ዝጋ' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

