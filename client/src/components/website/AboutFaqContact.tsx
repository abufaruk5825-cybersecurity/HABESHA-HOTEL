import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  ChevronDown, MapPin, Mail, Phone, Clock, Send, CheckCircle,
  Plane, Car, Navigation, ExternalLink, ShieldCheck, Building2,
  Compass
} from 'lucide-react';

export const AboutFaqContact: React.FC = () => {
  const { hotelSettings } = useAuth();
  const { t, language } = useLanguage();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Room Booking');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      q: language === 'am' ? 'የመግቢያና የመውጫ ሰዓታችሁ ስንት ነው?' : 'What are your check-in and check-out hours?',
      a: language === 'am' ? 'መግቢያ ከቀኑ 14:00 (8:00 ሰዓት) ጀምሮ ሲሆን መውጫ ደግሞ ረፋዱ 11:00 (5:00 ሰዓት) ነው። ቀድመው መግባት ወይም ማርፈድ ከፈለጉ እባክዎን ለሪሴፕሽን ቡድናችን አስቀድመው ያሳውቁ።' : 'Check-in is from 14:00 (2:00 PM) and check-out is at 11:00 AM. If you need early check-in or late check-out, please inform our front desk team upon arrival or during your online booking.',
    },
    {
      q: language === 'am' ? 'የቦሌ አውሮፕላን ማረፊያ ማመላለሻ አገልግሎት አላችሁ?' : 'Do you offer Bole Airport pickup and shuttle service?',
      a: language === 'am' ? 'አዎ! ከቦሌ ዓለም አቀፍ አውሮፕላን ማረፊያ (ተርሚናል 1 እና 2) ወደ ሆቴላችን እና ከሆቴላችን ወደ አየር ማረፊያ ምቹና አስተማማኝ ነፃ ማመላለሻ መኪና አለን። ሆቴላችን ከአየር ማረፊያው በ5 ደቂቃ ርቀት ላይ ይገኛል።' : 'Yes! We provide safe and comfortable airport shuttle transfers to and from Addis Ababa Bole International Airport (Terminals 1 & 2), just 5 minutes away from our hotel.',
    },
    {
      q: language === 'am' ? 'የባህል የኢትዮጵያ ምግብና ባህላዊ የቡና ሥነ-ሥርዓት ይቀርባል?' : 'Do you serve traditional Ethiopian food and coffee?',
      a: language === 'am' ? 'በእርግጥ! ሬስቶራንታችን እና የክፍል ውስጥ አገልግሎታችን ዶሮ ወጥ፣ የበሬ ጥብስ፣ የሸክላ ሽሮ ተጋቢኖ፣ ትኩስ የተፈጥሮ ጭማቂዎች እና የዕለት ባህላዊ የቡና ሥነ-ሥርዓት በጀበና ያቀርባሉ።' : 'Yes, absolutely! Our restaurant and room service offer authentic Ethiopian dishes including Doro Wat, sizzling Siga Tibs, clay pot Shiro, fresh tropical juices, and our daily traditional Ethiopian Coffee Ceremony (Buna Tetu).',
    },
    {
      q: language === 'am' ? 'ምን አይነት የክፍያ ዘዴዎችን ትቀበላላችሁ?' : 'What payment methods do you accept?',
      a: language === 'am' ? 'ጥሬ ገንዘብ (የኢትዮጵያ ብር እና ዶላር)፣ የባንክ ካርዶች (ቪዛ፣ ማስተርካርድ) እንዲሁም የሞባይል ባንኪንግ (የኢትዮጵያ ንግድ ባንክ CBE Birr እና ቴሌብር) እንቀበላለን።' : 'We accept cash (Ethiopian Birr and USD), credit and debit cards (Visa, Mastercard), and local mobile banking (Commercial Bank of Ethiopia / CBE and Telebirr).',
    },
    {
      q: language === 'am' ? 'በሁሉም ክፍሎች ፈጣን ዋይፋይና የሞቀ ውሃ ይገኛል?' : 'Is high-speed Wi-Fi and hot water available in all rooms?',
      a: language === 'am' ? 'አዎ፣ ፈጣን እና ያልተገደበ የፋይበር ዋይፋይ ኢንተርኔት እንዲሁም የ24-ሰዓት የሞቀ ውሃ ገላ መታጠቢያ በሁሉም ክፍሎች ውስጥ በነፃ ይገኛሉ።' : 'Yes, fast and unlimited high-speed Wi-Fi and 24-hour hot rainfall showers are provided free of charge in every room and across the entire hotel.',
    },
    {
      q: language === 'am' ? 'የቦታ ማስያዣ መሰረዣ ደንባችሁ ምንድን ነው?' : 'What is your cancellation policy?',
      a: language === 'am' ? 'እስከ 48 ሰዓት በፊት ያለምንም ክፍያ በነፃ መሰረዝ ይችላሉ። ከ48 ሰዓት ባነሰ ጊዜ ውስጥ ከተሰረዘ የአንድ ቀን የክፍል ዋጋ ክፍያ ተፈፃሚ ይሆናል።' : 'We offer free cancellation up to 48 hours before your arrival date. If cancelled within 48 hours, a fee equal to the first night room rate applies.',
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 6000);
  };

  const hotelAddress = hotelSettings.hotel_address || (language === 'am' ? 'ቦሌ ክፍለ ከተማ፣ አፍሪካ ጎዳና፣ አዲስ አበባ፣ ኢትዮጵያ' : 'Bole Sub-City, Africa Avenue (Bole Road), Addis Ababa, Ethiopia');
  const hotelPhone = hotelSettings.hotel_phone || '+251 11 667 8000';
  const hotelEmail = hotelSettings.hotel_email || 'reservations@habeshahotel.com';

  return (
    <div className="bg-slate-950 text-slate-100">
      {/* ──────────────────────────────────────────────────────────────────────────
          1. ABOUT US & HERITAGE SECTION (#about)
          ────────────────────────────────────────────────────────────────────────── */}
      <section id="about" className="scroll-mt-24 py-24 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-hotel.png"
                alt="HABESHA-HOTEL Logo"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/logo hotel.png';
                }}
                className="h-10 w-auto object-contain rounded-xl border border-amber-500/30 p-1 bg-slate-900/80 shadow-md"
              />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                {t('about.badge', 'Warm Ethiopian Hospitality')}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              {t('about.title', 'Modern Luxury & Ethiopian Culture in Addis Ababa')}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-light leading-relaxed">
              {t('about.desc1', 'Located on Africa Avenue in Bole, Addis Ababa, HABESHA-HOTEL offers a peaceful, modern hotel experience grounded in authentic Ethiopian hospitality. Just minutes from Bole International Airport, we cater to business executives, families, and international travelers.')}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm font-light leading-relaxed">
              {t('about.desc2', 'From our traditional coffee ceremonies and Habesha cultural dining to modern electronic room access, fast fiber internet, and rejuvenating spa facilities, we make every guest feel truly welcome.')}
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center sm:text-left">
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">{t('about.stat_location', 'Addis Ababa')}</span>
                <span className="block text-xs text-slate-400 mt-0.5">{t('about.stat_location_sub', 'Bole Sub-City')}</span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">{t('about.stat_rooms', '18+')}</span>
                <span className="block text-xs text-slate-400 mt-0.5">{t('about.stat_rooms_sub', 'Modern Rooms & Suites')}</span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">{t('about.stat_airport', '5 Min')}</span>
                <span className="block text-xs text-slate-400 mt-0.5">{t('about.stat_airport_sub', 'From Bole Airport')}</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="/images/hotel/suite-interior.jpg"
              alt="HABESHA-HOTEL luxury suite interior living room in Bole, Addis Ababa"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/images/hotel/hotel-lobby.jpg';
              }}
              className="rounded-2xl shadow-2xl border border-slate-800 object-cover w-full h-[450px]"
            />
            <div className="absolute -bottom-6 -left-6 bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 p-5 rounded-2xl hidden sm:block shadow-2xl">
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
                {language === 'am' ? 'የሆቴል አገልግሎት' : 'Hotel Service'}
              </span>
              <span className="font-serif text-base font-bold text-white">
                {language === 'am' ? 'የ24-ሰዓት ሪሴፕሽንና ክፍል ውስጥ አገልግሎት' : '24/7 Front Desk & Room Service'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. CONTACT & LOCATION SECTION (#contact)
          ────────────────────────────────────────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-24 py-24 border-t border-slate-900 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Compass className="w-3.5 h-3.5" />
              <span>{t('location.badge', 'Strategic Prime Location • Bole, Addis Ababa')}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              {t('location.heading', 'Contact & Hotel Location')}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
              {t('location.subtitle', 'Conveniently situated on Africa Avenue in Bole, Addis Ababa — 5 minutes from Bole International Airport.')}
            </p>
          </div>

          {/* ─────────────────── A. INTERACTIVE LOCATION & MAP HUB ─────────────────── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Map Iframe Column (7 cols) */}
              <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                <iframe
                  title="HABESHA-HOTEL Location Map on Africa Avenue, Bole, Addis Ababa"
                  src="https://maps.google.com/maps?q=Bole+Africa+Avenue+Addis+Ababa+Ethiopia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-[360px] sm:h-[420px] border-0 filter contrast-[1.05] brightness-[0.95]"
                  loading="lazy"
                  allowFullScreen
                />
                {/* Floating Map Pin Badge */}
                <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">HABESHA-HOTEL</p>
                    <p className="text-[10px] text-amber-400 leading-tight">Bole Road, Addis Ababa</p>
                  </div>
                </div>

                {/* Map Quick Action Link */}
                <div className="absolute bottom-4 right-4">
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

              {/* Location Highlights & Proximity Details (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  <span>{language === 'am' ? 'የሆቴሉ መገኛና አቅጣጫዎች' : 'Location Highlights'}</span>
                </h3>

                <div className="space-y-3">
                  {/* Address */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('location.address_label', 'Physical Address')}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{hotelAddress}</p>
                    </div>
                  </div>

                  {/* Airport Proximity */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                    <Plane className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('location.airport_label', 'Bole International Airport (ADD)')}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t('location.airport_val', '5 Minutes (2.1 km) via Africa Avenue Express')}</p>
                    </div>
                  </div>

                  {/* Airport Shuttle */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                    <Car className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('location.shuttle_label', 'Airport Shuttle Service')}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t('location.shuttle_val', 'Complimentary 24/7 airport pick-up & drop-off')}</p>
                    </div>
                  </div>

                  {/* Parking & Security */}
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">{t('location.parking_label', 'Parking & Security')}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t('location.parking_val', 'Free secure underground valet parking with 24/7 CCTV')}</p>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Bole+Africa+Avenue+Addis+Ababa+Ethiopia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>{t('location.get_directions', 'Get Directions')}</span>
                  </a>
                  <a
                    href={`tel:${hotelPhone}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>{hotelPhone}</span>
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* ─────────────────── B. FAQ & CONTACT MESSAGE FORM GRID ─────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* FAQ Accordion */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  {language === 'am' ? 'የተለመዱ ጥያቄዎች' : 'Common Questions'}
                </span>
                <h3 className="font-serif text-3xl font-bold text-white tracking-tight">
                  {t('about.faq_heading', 'Frequently Asked Questions')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('about.faq_subtitle', 'Everything you need to know about staying at HABESHA-HOTEL.')}
                </p>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all shadow-md"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-4 h-4 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact & Concierge Form */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  {language === 'am' ? 'የእንግዳ መቀበያ አድራሻ' : 'Front Desk Contact'}
                </span>
                <h3 className="font-serif text-3xl font-bold text-white tracking-tight">
                  {t('about.contact_heading', 'Send Us a Message')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('about.contact_subtitle', 'Reach out anytime for airport shuttles, dining reservations, or suite inquiries.')}
                </p>
              </div>

              <div className="p-6 sm:p-7 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
                {sent && (
                  <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{t('about.form_sent_notice', 'Your message has been sent to our concierge team. We will reply within 30 minutes.')}</span>
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">{t('about.form_name', 'Your Full Name')}</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={language === 'am' ? 'ለምሳሌ፦ ሙራድ ካሲም' : 'e.g. Murad Kassim'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">{t('about.form_email', 'Email Address')}</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{t('about.form_subject', 'Inquiry Subject')}</label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Room Booking">{language === 'am' ? 'የክፍል ማስያዝ እና የቆይታ ጥያቄ' : 'Room Booking & Stay Inquiries'}</option>
                      <option value="Dining & Catering">{language === 'am' ? 'ባህላዊ ምግብና የቡና ሥነ-ሥርዓት' : 'Traditional Dining & Ethiopian Coffee Ceremony'}</option>
                      <option value="Meeting Hall Rental">{language === 'am' ? 'የስብሰባ አዳራሽ ኪራይ' : 'Meeting Hall & Event Rental'}</option>
                      <option value="Airport Shuttle">{language === 'am' ? 'የቦሌ አየር ማረፊያ ማመላለሻ መኪና' : 'Bole Airport Pickup / Drop-off'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">{t('about.form_message', 'Message')}</label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={language === 'am' ? 'የእንግዳ መቀበያ ቡድናችን ዛሬ በምን ሊረዳዎ ይችላል?' : 'How can our front desk team help you today?'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('about.form_send', 'Send Message to Concierge')}</span>
                  </button>
                </form>

                {/* Direct Contact Bar */}
                <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400">
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{t('about.contact_hours', 'Reception Desk: 24/7 Service')}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <a href={`mailto:${hotelEmail}`} className="hover:text-amber-300 truncate">
                      {hotelEmail}
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};
