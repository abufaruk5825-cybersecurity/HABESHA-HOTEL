import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Calendar } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  showCalendar?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showCalendar = true
}) => {
  const { language, setLanguage, calendar, setCalendar } = useLanguage();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Language Toggle Button Pill */}
      <div className="inline-flex items-center bg-slate-900 border border-amber-500/30 rounded-lg p-0.5 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 rounded transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-100'
          }`}
          title="English language"
          type="button"
        >
          EN
        </button>
        <span className="text-slate-600 text-[10px]">|</span>
        <button
          onClick={() => setLanguage('am')}
          className={`px-2 py-1 rounded transition-all cursor-pointer font-serif ${
            language === 'am'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-amber-300'
          }`}
          title="የአማርኛ ቋንቋ"
          type="button"
        >
          አማርኛ
        </button>
      </div>

      {/* Calendar Toggle Button Pill (Gregorian vs Ethiopian Calendar) */}
      {showCalendar && (
        <div className="inline-flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shadow-sm text-[11px] font-medium">
          <button
            onClick={() => setCalendar(calendar === 'gregorian' ? 'ethiopian' : 'gregorian')}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            title={calendar === 'ethiopian' ? 'Currently using Ethiopian Calendar (ዓ.ም.) - Click to switch to Gregorian' : 'Currently using Gregorian Calendar (G.C.) - Click to switch to Ethiopian'}
            type="button"
          >
            <Calendar className="w-3 h-3 text-amber-400" />
            <span className="font-semibold text-[10px]">
              {calendar === 'ethiopian' ? 'ዓ.ም. (EC)' : 'G.C.'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

