import React, { useState } from 'react';
import {
  Users,
  HeartHandshake,
  Languages,
  Award,
  MessageSquareQuote,
  Quote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StaffMember {
  id: string;
  name: string;
  amharicName: string;
  role: string;
  roleAm?: string;
  department: string;
  deptAm?: string;
  experience: string;
  experienceAm?: string;
  languages: string[];
  image: string;
  fallbackImage: string;
  bio: string;
  bioAm?: string;
  badge: string;
}

export const STAFF_DATA: StaffMember[] = [
  {
    id: 'selam',
    name: 'Selam Tesfaye',
    amharicName: 'ሰላም ተስፋዬ',
    role: 'General Director & Administrator',
    roleAm: 'ዋና ዳይሬክተር እና አስተዳዳሪ',
    department: 'Executive Management',
    deptAm: 'የስራ አመራር',
    experience: '12+ Years in 5-Star Hospitality',
    experienceAm: '12+ ዓመት በባለ 5-ኮከብ መስተንግዶ',
    languages: ['Amharic', 'English', 'French'],
    image: '/images/staff/selam-tesfaye.png',
    fallbackImage: '/images/staff/selam tesfaye.png',
    bio: 'Dedicated to upholding timeless Habesha hospitality alongside international 5-star hotel standards for business leaders, AU delegates, and leisure travelers.',
    bioAm: 'ለዲፕሎማቶች፣ ለንግድ መሪዎችና ለጎብኚዎች ዓለም አቀፍ ደረጃውን የጠበቀ እንከን የለሽ የሐበሻ መስተንግዶ ለመስጠት በቁርጠኝነት እሰራለሁ።',
    badge: 'Executive Leadership',
  },
  {
    id: 'bilal',
    name: 'Bilal Ahmed',
    amharicName: 'ቢላል አህመድ',
    role: 'Hotel Operations Manager',
    roleAm: 'የሆቴል ኦፕሬሽን ስራ አስኪያጅ',
    department: 'Operations & Guest Experience',
    deptAm: 'ኦፕሬሽን እና እንግዳ አገልግሎት',
    experience: '9+ Years Hotel Operations',
    experienceAm: '9+ ዓመት በሆቴል ኦፕሬሽን',
    languages: ['Amharic', 'English', 'Arabic', 'Oromo'],
    image: '/images/staff/bilal.webp',
    fallbackImage: '/images/staff/bilal.webp',
    bio: 'Oversees 24/7 guest service, airport transfer coordination, rapid room readiness, and seamless hotel logistics in Bole, Addis Ababa.',
    bioAm: 'የ24-ሰዓት የእንግዳ አገልግሎት፣ የአውሮፕላን ማረፊያ ማመላለሻና የክፍል ዝግጁነት አስተማማኝ እንዲሆን በትጋት እቆጣጠራለሁ።',
    badge: 'Operations Lead',
  },
  {
    id: 'firdews',
    name: 'Firdews Mohammed',
    amharicName: 'ፊርደውስ መሀመድ',
    role: 'Head Concierge & Front Desk Receptionist',
    roleAm: 'ዋና እንግዳ ተቀባይ እና ሪሴፕሽን',
    department: 'Front Desk & Concierge',
    deptAm: 'የፊት ጠረጴዛ እና መስተንግዶ',
    experience: '7+ Years Concierge & Travel',
    experienceAm: '7+ ዓመት በእንግዳ አቀባበል',
    languages: ['Amharic', 'English', 'Arabic', 'Tigrinya'],
    image: '/images/staff/firdews.jpg',
    fallbackImage: '/images/staff/firdews.jpg',
    bio: 'First point of welcoming contact for our guests. Specializes in express VIP check-in, currency assistance, and curating Addis Ababa cultural excursions.',
    bioAm: 'እንግዶቻችንን በፈገግታ መቀበል፣ ፈጣን ቼክ-ኢን መስጠት እና የአዲስ አበባ የባህል ጉብኝቶችን ማመቻቸት ዋና ሙያዬ ነው።',
    badge: 'Head Concierge',
  },
  {
    id: 'hiwot',
    name: 'Hiwot Tadesse',
    amharicName: 'ህይወት ታደሰ',
    role: 'Lead Housekeeping Supervisor',
    roleAm: 'የጽዳት እና የቤት አያያዝ ኃላፊ',
    department: 'Housekeeping & Facility Care',
    deptAm: 'የክፍል ጽዳትና ንጽሕና',
    experience: '8+ Years Hygiene & Sanitation',
    experienceAm: '8+ ዓመት በንጽሕና ቁጥጥር',
    languages: ['Amharic', 'English'],
    image: '/images/staff/hiwot-housekeeper.jpg',
    fallbackImage: '/images/staff/hiwot-housekeeper.jpg',
    bio: 'Ensures our 5-star cleanliness pledge, pristine bed linen turnover, fresh eucalyptus room scents, and spotless sanitation in every suite.',
    bioAm: 'በእያንዳንዱ ክፍል የባለ 5-ኮከብ ንጽሕናን፣ የባህር ዛፍ መዓዛን እና እንከን የለሽ የተነጠፉ አልጋዎችን ለማረጋገጥ ቀን ተሌት እንተጋለን።',
    badge: 'Hygiene & Cleanliness',
  },
  {
    id: 'sumeya',
    name: 'Sumeya Ahmed',
    amharicName: 'ሱመያ አህመድ',
    role: 'Senior Facilities & Systems Engineer',
    roleAm: 'ዋና የሲስተምስ እና ጥገና መሃንዲስ',
    department: 'Engineering & Maintenance',
    deptAm: 'ኢንጂነሪንግና ሲስተምስ',
    experience: '10+ Years Building Systems & Guest Technology',
    experienceAm: '10+ ዓመት በቴክኖሎጂና ጥገና',
    languages: ['Amharic', 'English', 'Arabic'],
    image: '/images/staff/Sumeya Ahmed.png',
    fallbackImage: '/images/staff/image.png',
    bio: 'Maintains our high-speed fibre Wi-Fi infrastructure, digital climate controls, uninterruptible power backups, and pure water filtration systems.',
    bioAm: 'ፈጣን ፋይበር ዋይፋይ፣ አስተማማኝ የኃይል ጀነሬተር፣ ንጹሕ የውሃ ማጣሪያ እና ዘመናዊ ኤር-ኮንዲሽነር ሁልጊዜ ዝግጁ መሆናቸውን አረጋግጣለሁ።',
    badge: 'Systems & Facilities',
  },
];

export const StaffSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [expandedBios, setExpandedBios] = useState<Record<string, boolean>>({});

  const toggleBio = (id: string) => {
    setExpandedBios(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="staff" className="py-24 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Decorative Habesha subtle background motif */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            <Users className="w-3.5 h-3.5" /> {t('staff.badge', 'Our Hospitality Family • የኛ እንግዳ ተቀባዮች')}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            {t('staff.title', 'Meet Our Dedicated Ethiopian Team')}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
            {t('staff.subtitle', 'Authentic warmth is the soul of Ethiopian hospitality. Our trained professionals ensure your arrival, stay, dining, and departure in Addis Ababa are peaceful, safe, and memorable.')}
          </p>
        </div>

        {/* Staff Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {STAFF_DATA.map((member) => (
            <div
              key={member.id}
              className="group bg-slate-950/80 rounded-2xl overflow-hidden border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col"
            >
              {/* Photo Container */}
              <div className="relative h-64 overflow-hidden bg-slate-900">
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = member.fallbackImage;
                  }}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Badge */}
                <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-300 border border-amber-500/30">
                  {member.badge}
                </span>

                {/* Amharic Name Overlay */}
                <span className="absolute bottom-3 right-3 text-xs font-semibold text-amber-400/90 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/20 font-serif">
                  {member.amharicName}
                </span>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {language === 'am' ? member.amharicName : member.name}
                      </h3>
                      {language === 'am' && (
                        <span className="text-[10px] text-slate-400 block font-sans truncate">
                          {member.name}
                        </span>
                      )}
                      <p className="text-xs font-semibold text-amber-400 mt-0.5">
                        {language === 'am' && member.roleAm ? member.roleAm : member.role}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {language === 'am' && member.deptAm ? member.deptAm : member.department}
                      </p>
                    </div>

                    {/* Interactive Bio Quote Toggle Icon */}
                    <button
                      type="button"
                      onClick={() => toggleBio(member.id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                        expandedBios[member.id]
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                          : 'bg-slate-900/90 text-amber-400 border-slate-700/80 hover:bg-slate-800 hover:text-amber-300 hover:border-amber-500/50'
                      }`}
                      title={expandedBios[member.id] ? t('staff.hide_quote', 'Hide personal quote') : t('staff.view_quote', 'Click to view personal hospitality message')}
                      aria-label="Toggle staff hospitality quote"
                    >
                      <MessageSquareQuote className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Hospitality Quote Paragraph - Hidden by default, shown ONLY when icon is clicked */}
                  {expandedBios[member.id] && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/95 border border-amber-500/40 text-slate-300 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                        <Quote className="w-3 h-3" /> {t('staff.hospitality_pledge', 'Hospitality Pledge')}
                      </div>
                      <p className="text-slate-300 text-xs font-light leading-relaxed italic">
                        "{language === 'am' && member.bioAm ? member.bioAm : member.bio}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Tags */}
                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{language === 'am' && member.experienceAm ? member.experienceAm : member.experience}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{member.languages.join(' • ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ethiopian Hospitality Guarantee Banner */}
        <div className="mt-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-white">{t('staff.banner_title', '24/7 Ethiopian Hospitality Concierge')}</h4>
              <p className="text-xs sm:text-sm text-slate-400 font-light mt-0.5">
                {t('staff.banner_desc', 'Our front desk and concierge team speak English, Amharic, Oromo, Tigrinya, and Arabic to assist every international traveler.')}
              </p>
            </div>
          </div>
          <a
            href="#contact"
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap transition-colors shadow-lg shadow-amber-500/20"
          >
            {language === 'am' ? 'ከእንግዳ መቀበያ ጋር ይነጋገሩ' : 'Speak with Front Desk'}
          </a>
        </div>
      </div>
    </section>
  );
};
