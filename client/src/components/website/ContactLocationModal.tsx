import React, { useState } from 'react';
import {
  X, MapPin, Phone, Mail, Send, Instagram, Navigation, ExternalLink,
  Copy, Check, Clock, ShieldCheck, Plane, Car, Building2, Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface ContactLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const ContactLocationModal: React.FC<ContactLocationModalProps> = ({
  isOpen,
  onClose,
  onScrollToSection,
}) => {
  const { hotelSettings } = useAuth();
  const { t, language } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Room Booking');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const hotelAddress = hotelSettings.hotel_address || (
    language === 'am'
      ? 'ቦሌ ክፍለ ከተማ፣ አፍሪካ ጎዳና (ቦሌ መንገድ)፣ አዲስ አበባ፣ ኢትዮጵያ'
      : 'Bole Sub-City, Africa Avenue (Bole Road), Addis Ababa, Ethiopia'
  );
  const hotelPhone = hotelSettings.hotel_phone || '+251 11 667 8000';
  const hotelEmail = hotelSettings.hotel_email || 'reservations@habeshahotel.com';
  const hotelTelegram = hotelSettings.hotel_telegram || '@Abuzubeir1234';
  const hotelTelegramLink = hotelSettings.hotel_telegram_link || 'https://t.me/Abuzubeir1234';
  const hotelInstagram = hotelSettings.hotel_instagram || 'seyaman5825';
  const hotelInstagramLink = hotelSettings.hotel_instagram_link || 'https://instagram.com/seyaman5825';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(hotelAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 5000);
  };

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
                (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png';
              }}
              className="h-9 w-auto object-contain rounded-lg border border-amber-500/30 bg-slate-900 p-1"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
                  HABESHA<span className="text-amber-400 font-light">-HOTEL</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  <Compass className="w-3 h-3" />
                  <span>{language === 'am' ? 'የሆቴል መገኛና አድራሻ' : 'Hotel Location & Contact'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {language === 'am'
                  ? 'ቦሌ አፍሪካ ጎዳና፣ አዲስ አበባ • ከቦሌ አየር ማረፊያ በ5 ደቂቃ ርቀት'
                  : 'Africa Avenue, Bole Sub-City, Addis Ababa • 5 mins from Bole Airport'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScrollAndClose('contact')}
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Main Grid: Left Column (Map & Location Highlights) + Right Column (Contacts & Inquiry) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ─── LEFT COLUMN: MAP & PHYSICAL LOCATION (7 COLS) ─── */}
            <div className="lg:col-span-7 space-y-4">
              {/* Map Container */}
              <div className="relative group rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                <iframe
                  title="HABESHA-HOTEL Location Map on Africa Avenue, Bole, Addis Ababa"
                  src="https://maps.google.com/maps?q=Bole+Africa+Avenue+Addis+Ababa+Ethiopia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-[260px] sm:h-[320px] border-0 filter contrast-[1.05] brightness-[0.95]"
                  loading="lazy"
                  allowFullScreen
                />

                {/* Floating Map Pin Badge */}
                <div className="absolute top-3 left-3 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">HABESHA-HOTEL</p>
                    <p className="text-[10px] text-amber-400 leading-tight">Africa Ave, Bole, Addis Ababa</p>
                  </div>
                </div>

                {/* Map Quick Action Buttons */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Bole+Africa+Avenue+Addis+Ababa+Ethiopia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg transition-all"
                  >
                    <span>{t('location.get_directions', 'Open in Google Maps')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Physical Address Card with Copy Button */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 shadow-md">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        {language === 'am' ? 'የሆቴሉ ትክክለኛ አድራሻ' : 'Physical Hotel Address'}
                      </p>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        GPS: 9.0054° N, 38.7844° E
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                      {hotelAddress}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'am'
                        ? 'ከቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ (ተርሚናል 1 እና 2) በ5 ደቂቃ (2.1 ኪ.ሜ) ርቀት ላይ'
                        : 'Conveniently situated on Africa Avenue, just 5 minutes (2.1 km) from Bole International Airport'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyAddress}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
                  title="Copy full address"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px] font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Proximity & Convenience Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <Plane className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {language === 'am' ? 'ቦሌ አየር ማረፊያ (ADD)' : 'Bole Airport (ADD)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'am' ? '5 ደቂቃ (2.1 ኪ.ሜ) በአፍሪካ ጎዳና' : '5 mins (2.1 km) via Africa Ave'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <Car className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {language === 'am' ? 'የነፃ አየር ማረፊያ ማመላለሻ' : 'Free Airport Shuttle'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'am' ? '24/7 ከተርሚናል 1 እና 2 ነፃ ማንሳት' : '24/7 pick-up & drop-off included'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {language === 'am' ? 'ሚሌኒየም አዳራሽና ኤድና ሞል' : 'Millennium Hall & Edna Mall'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'am' ? '3-4 ደቂቃ የእግር ጉዞ (800 ሜትር)' : '3-4 mins walk (800m - 1.2km)'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {language === 'am' ? 'የመኪና ማቆሚያና 24/7 ጥበቃ' : 'Valet Parking & CCTV'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'am' ? 'ነፃ የመሬት ውስጥ ማቆሚያ' : 'Free underground secure valet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: DIRECT CONTACTS & INQUIRY FORM (5 COLS) ─── */}
            <div className="lg:col-span-5 space-y-4">
              {/* Quick Communication Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'am' ? 'የ24-ሰዓት የቀጥታ ግንኙነት' : '24/7 Direct Channels'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {language === 'am' ? 'አሁን ክፍት' : 'Live Now'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Phone */}
                  <a
                    href={`tel:${hotelPhone}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          {language === 'am' ? 'የሪሴፕሽን ስልክ' : 'Front Desk Phone'}
                        </p>
                        <p className="font-bold text-white">{hotelPhone}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-amber-400 font-semibold">{language === 'am' ? 'ይደውሉ' : 'Call'}</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:${hotelEmail}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="max-w-[190px] truncate">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">
                          {language === 'am' ? 'ኢሜይል' : 'Reservations Email'}
                        </p>
                        <p className="font-bold text-white truncate">{hotelEmail}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-amber-400 font-semibold">{language === 'am' ? 'ላክ' : 'Email'}</span>
                  </a>

                  {/* Telegram and Instagram Direct Chat Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={hotelTelegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-sky-950/70 hover:bg-sky-900/90 border border-sky-500/50 hover:border-sky-400 text-sky-400 hover:text-sky-300 transition-all shadow-md group"
                      title="Direct Telegram Chat: @Abuzubeir1234"
                    >
                      <Send className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-bold">Telegram</span>
                    </a>

                    <a
                      href={hotelInstagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 rounded-xl bg-pink-950/70 hover:bg-pink-900/90 border border-pink-500/50 hover:border-pink-400 text-pink-400 hover:text-pink-300 transition-all shadow-md group"
                      title="Direct Instagram Profile: @seyaman5825"
                    >
                      <Instagram className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span className="text-xs font-bold">Instagram</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct Concierge Inquiry Form */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-lg">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {language === 'am' ? 'ለኮንሲየርጅ ቀጥታ መልእክት ይላኩ' : 'Send Message to Concierge'}
                </span>

                {sent ? (
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs text-center space-y-1">
                    <p className="font-bold">
                      {language === 'am' ? 'መልእክትዎ በተሳካ ሁኔታ ደርሷል!' : 'Message Sent Successfully!'}
                    </p>
                    <p className="text-[11px] text-emerald-400/80">
                      {language === 'am' ? 'የእንግዳ ተቀባይ ቡድናችን በአጭር ጊዜ ውስጥ ያገኝዎታል።' : 'Our concierge team will respond shortly.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'am' ? 'ስምዎ' : 'Your Name'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'am' ? 'ኢሜይል' : 'Email Address'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Room Booking">{language === 'am' ? 'የክፍል ማስያዝ ጥያቄ' : 'Room Booking / Reservation'}</option>
                      <option value="Airport Shuttle">{language === 'am' ? 'የቦሌ አየር ማረፊያ ማመላለሻ' : 'Bole Airport Pickup / Drop-off'}</option>
                      <option value="Dining & Buna">{language === 'am' ? 'ባህላዊ ምግብና ቡና ሥነ-ሥርዓት' : 'Traditional Dining & Coffee Ceremony'}</option>
                      <option value="Corporate / Event">{language === 'am' ? 'የስብሰባ አዳራሽ ኪራይ' : 'Meeting & Event Hall Inquiry'}</option>
                    </select>

                    <textarea
                      required
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={language === 'am' ? 'መልእክትዎን እዚህ ይጻፉ...' : 'How can we assist you today?'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                    />

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'am' ? 'መልእክት ላክ' : 'Send Instant Inquiry'}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Action Footer */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'am' ? 'የ24-ሰዓት ፈጣን አገልግሎት በቦሌ' : '24/7 Front Desk in Bole, Addis Ababa'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScrollAndClose('contact')}
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

