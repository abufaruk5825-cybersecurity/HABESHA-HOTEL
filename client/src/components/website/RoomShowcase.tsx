import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RoomType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Users,
  Bed,
  Maximize2,
  Wifi,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Crown
} from 'lucide-react';

interface RoomShowcaseProps {
  onSelectRoomType: (roomTypeId: number) => void;
}

export const RoomShowcase: React.FC<RoomShowcaseProps> = ({ onSelectRoomType }) => {
  const { currency } = useAuth();
  const { t, language } = useLanguage();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'rooms' | 'suites'>('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    api.get<RoomType[]>('/rooms/types')
      .then(res => {
        setRoomTypes(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTypes = roomTypes.filter(rt => {
    if (activeFilter === 'rooms') return rt.base_price < 350;
    if (activeFilter === 'suites') return rt.base_price >= 350;
    return true;
  });

  return (
    <section id="rooms" className="py-20 bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
            <Crown className="w-4 h-4" /> {t('rooms.badge', 'Rooms & Suites')}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            {t('rooms.title', 'Comfortable Rooms & Luxury Suites')}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light leading-relaxed">
            {t('rooms.subtitle', 'Every room at HABESHA-HOTEL in Addis Ababa is designed for your total comfort—with fast Wi-Fi, hot rainfall showers, comfortable beds, air conditioning, and peaceful city views.')}
          </p>

          {/* Filter Pills */}
          <div className="inline-flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 mt-6 text-xs font-semibold">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('rooms.filter_all', 'All Rooms')} ({roomTypes.length})
            </button>
            <button
              onClick={() => setActiveFilter('rooms')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'rooms' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('rooms.filter_standard', 'Standard & Deluxe Rooms')}
            </button>
            <button
              onClick={() => setActiveFilter('suites')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeFilter === 'suites' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('rooms.filter_suites', 'Executive & Family Suites')}
            </button>
          </div>
        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-96 rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTypes.map(rt => (
              <div
                key={rt.id}
                className="group bg-slate-950/60 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col"
              >
                {/* Image Container with Badges */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={rt.image_url || '/images/rooms/standard-single.jpg'}
                    alt={rt.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/rooms/standard-single.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                  {/* Pricing Badge */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-lg text-slate-100 shadow-lg">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block text-[10px]">From</span>
                    <span className="font-serif text-lg font-bold text-amber-400">{currency}{rt.base_price}</span>
                    <span className="text-xs text-slate-400"> / {t('rooms.per_night', 'night')}</span>
                  </div>

                  {/* Code Tag */}
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider text-amber-300 border border-amber-500/30">
                    {rt.code}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                      {rt.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-light leading-relaxed mt-2 line-clamp-3">
                      {rt.description}
                    </p>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-slate-300 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{rt.capacity} {t('rooms.guests_label', 'Guests')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bed className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">{rt.bed_type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{rt.size_sqm} m²</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800">
                      {language === 'am' ? 'ፈጣን ነፃ ዋይፋይ' : 'Fast Free Wi-Fi'}
                    </span>
                    <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800">
                      {language === 'am' ? 'የሙቅ ውሀ ሻወር' : 'Rainfall Shower'}
                    </span>
                    <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800">
                      {language === 'am' ? 'የቡናና ሻይ ማዘጋጃ' : 'Buna & Tea Setup'}
                    </span>
                    {rt.base_price >= 350 && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-1 rounded border border-amber-500/30">
                        {language === 'am' ? 'የቪአይፒ ላውንጅ መግቢያ' : 'VIP Lounge Access'}
                      </span>
                    )}
                  </div>

                  {/* Action CTA */}
                  <div className="pt-2">
                    <button
                      onClick={() => onSelectRoomType(rt.id)}
                      className="w-full bg-slate-800 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 text-amber-300 border border-slate-700 hover:border-amber-400 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>{t('rooms.book_now', 'Book This Room')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
