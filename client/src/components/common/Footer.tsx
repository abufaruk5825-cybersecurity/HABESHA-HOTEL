import React from 'react';
import { Crown, ShieldCheck, Award, Heart, Send, Instagram, Phone, Mail, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  onOpenAboutModal?: () => void;
  onOpenContactModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAboutModal,
  onOpenContactModal,
}) => {
  const { hotelSettings } = useAuth();
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 py-16 text-xs">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-hotel.png"
                alt="HABESHA-HOTEL Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png';
                }}
                className="h-10 w-auto object-contain rounded-lg shadow-md"
              />
              <span className="font-serif text-xl font-bold tracking-wider text-slate-100">
                HABESHA<span className="text-amber-400 font-light">-HOTEL</span>
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed font-light">
              {t('footer.description', 'A modern 5-star hotel in Bole, Addis Ababa, combining genuine Ethiopian hospitality with luxury suites, authentic cultural dining, and 24/7 guest service.')}
            </p>
            <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{t('footer.hospitality_line', 'Authentic Ethiopian Hospitality • Bole, Addis Ababa')}</span>
            </div>

            {/* Direct Social & Messaging Links */}
            <div className="pt-2 space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {language === 'am' ? 'ቀጥታ መልእክትና ማህበራዊ ገፆች' : 'Direct Instant Chat & Social'}
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href={hotelSettings.hotel_telegram_link || 'https://t.me/Abuzubeir1234'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 hover:border-sky-400 text-sky-400 hover:text-sky-300 flex items-center justify-center transition-all shadow-md hover:scale-105"
                  title="Telegram"
                  aria-label="Telegram"
                >
                  <Send className="w-4 h-4" />
                </a>
                <a
                  href={hotelSettings.hotel_instagram_link || 'https://instagram.com/seyaman5825'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-500/40 hover:border-pink-400 text-pink-400 hover:text-pink-300 flex items-center justify-center transition-all shadow-md hover:scale-105"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Suites & Rooms */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-3">{t('footer.rooms_heading', 'Rooms & Suites')}</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#rooms" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'ስታንዳርድ ነጠላ እና ድርብ ክፍሎች' : 'Standard Single & Double'}</a></li>
              <li><a href="#rooms" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'ዲሉክስ ኪንግ ክፍሎች' : 'Deluxe King Rooms'}</a></li>
              <li><a href="#rooms" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'የቤተሰብ ግራንድ ስዊቶች' : 'Family Grand Suites'}</a></li>
              <li><a href="#rooms" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'ኤግዚክዩቲቭ ክለብ ስዊቶች' : 'Executive Club Suites'}</a></li>
              <li><a href="#rooms" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'ፕሬዝዳንሻል ፔንትሃውስ' : 'Presidential Penthouse'}</a></li>
            </ul>
          </div>

          {/* Hotel Services */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-3">{t('footer.dining_heading', 'Dining & Experiences')}</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#food-menu" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'የኢትዮጵያና የዓለም አቀፍ ምግብ ዝርዝር' : 'Ethiopian & International Food Menu'}</a></li>
              <li><a href="#services" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'የሐበሻ ባህላዊ ሬስቶራንት' : 'Habesha Cultural Restaurant'}</a></li>
              <li><a href="#food-menu" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'ባህላዊ የቡና ሥነ-ሥርዓት (ቡና ጠጡ)' : 'Traditional Coffee Ceremony (Buna)'}</a></li>
              <li><a href="#gallery" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'የሆቴል ፎቶ ጋለሪ' : 'Hotel Photo Gallery'}</a></li>
              <li><a href="#staff" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'የሆቴሉ እንግዳ ተቀባዮች' : 'Our Ethiopian Hospitality Staff'}</a></li>
              <li><a href="#services" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'የባህር ዛፍ ስቲም እና ማሳጅ ስፓ' : 'Eucalyptus Steam & Massage Spa'}</a></li>
              <li><a href="#services" className="hover:text-amber-400 transition-colors">{language === 'am' ? 'የቦሌ አየር ማረፊያ ማመላለሻ ሹፌር' : 'Bole Airport Pickup Shuttle'}</a></li>
              <li>
                <button
                  onClick={() => {
                    onOpenAboutModal?.();
                    const el = document.getElementById('about');
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  {language === 'am' ? 'ስለ እኛ እና የሆቴሉ ታሪክ' : 'About Us & Heritage'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onOpenContactModal?.();
                    const el = document.getElementById('contact') || document.getElementById('location');
                    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  {language === 'am' ? 'የሆቴሉ አድራሻ እና መገኛ ካርታ' : 'Contact & Hotel Location'}
                </button>
              </li>
            </ul>
          </div>

          {/* Hotel Policies */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-3">{t('footer.policies_heading', 'Hotel Policies')}</h4>
            <ul className="space-y-2 text-slate-400">
              <li>{t('footer.policy_checkin', 'Check-in: 14:00 | Check-out: 11:00')}</li>
              <li>{t('footer.policy_cancel', '48-Hour Free Cancellation Policy')}</li>
              <li>{t('footer.policy_smoking', 'Non-Smoking Hotel Rooms')}</li>
              <li>{t('footer.policy_payment', 'Card, Telebirr & Cash Accepted')}</li>
              <li>{t('footer.policy_security', 'Secure System Records & Fast Check-in')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {hotelSettings.hotel_name || 'HABESHA-HOTEL'}. {t('footer.all_rights', 'All Rights Reserved.')}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('footer.system_line', 'Fullstack Smart Hotel Management System (SHMS)')}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
