import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronDown, MapPin, Mail, Phone, Clock, Send, CheckCircle } from 'lucide-react';

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

  return (
    <div className="bg-slate-950 text-slate-100">
      {/* About Section */}
      <section className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
            <div className="absolute -bottom-6 -left-6 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 p-5 rounded-2xl hidden sm:block shadow-2xl">
              <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">{language === 'am' ? 'የሆቴል አገልግሎት' : 'Hotel Service'}</span>
              <span className="font-serif text-base font-bold text-white">{language === 'am' ? 'የ24-ሰዓት ሪሴፕሽንና ክፍል ውስጥ አገልግሎት' : '24/7 Front Desk & Room Service'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Contact Grid */}
      <section className="py-24 border-t border-slate-900 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ Accordion */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                {language === 'am' ? 'የተለመዱ ጥያቄዎች' : 'Common Questions'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
                {t('about.faq_heading', 'Frequently Asked Questions')}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden transition-all"
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

          {/* Contact Form & Location */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                {language === 'am' ? 'የእንግዳ መቀበያ አድራሻ' : 'Front Desk Contact'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-white tracking-tight">
                {t('about.contact_heading', 'Send Us a Message')}
              </h2>
            </div>

            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
              {sent && (
                <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('about.form_sent_notice', 'Your message has been sent to our front desk team. We will contact you promptly.')}</span>
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
                      placeholder="murad.k@gmail.com"
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

              {/* Physical Info Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{hotelSettings.hotel_address || (language === 'am' ? 'ቦሌ ክፍለ ከተማ፣ አፍሪካ ጎዳና፣ አዲስ አበባ፣ ኢትዮጵያ' : 'Bole Sub-City, Africa Avenue, Addis Ababa, Ethiopia')}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{hotelSettings.hotel_phone || '+251 11 667 8000'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
