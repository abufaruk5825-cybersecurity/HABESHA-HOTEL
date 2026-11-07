/**
 * FoodSlider — full-width auto-playing image carousel showcasing the hotel's
 * Ethiopian cuisine and restaurant offerings.
 *
 * Uses only locally-hosted images from /images/food/.
 * Auto-advances every 3 s with a CSS cross-fade; the user can also navigate
 * manually via arrows or dot indicators. Pauses on hover.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Utensils, Star } from 'lucide-react';

// ─── Slide data — all images are local, no external URLs ─────────────────────
interface Slide {
  src: string;
  fallback: string;
  title: string;
  subtitle: string;
  tag: string;
  accent: string; // Tailwind gradient classes for the overlay tint
}

const SLIDES: Slide[] = [
  {
    src: '/images/food/classic-doro-wat.jpg',
    fallback: '/images/food/doro-wat.jpg',
    title: 'Classic Doro Wat',
    subtitle: "Ethiopia's signature slow-cooked chicken stew with berbere spice, served on freshly baked injera",
    tag: 'Signature Dish',
    accent: 'from-rose-950/80 via-slate-950/60 to-transparent',
  },
  {
    src: '/images/food/coffee-ceremony.jpg',
    fallback: '/images/food/Traditional Coffee Ceremony Experience.jpg',
    title: 'Ethiopian Coffee Ceremony',
    subtitle: 'Freshly roasted and brewed Yirgacheffe coffee served in traditional jebena clay pots',
    tag: 'Cultural Experience',
    accent: 'from-amber-950/80 via-slate-950/60 to-transparent',
  },
  {
    src: '/images/food/siga-tibs.jpg',
    fallback: '/images/food/tibs.jpg',
    title: 'Siga Tibs',
    subtitle: "Tender pan-seared beef cubes with onions, rosemary and green peppers — a favourite at our grill",
    tag: "Chef's Favourite",
    accent: 'from-orange-950/80 via-slate-950/60 to-transparent',
  },
  {
    src: '/images/food/shiro-tegabino-with-fresh-salad.jpg',
    fallback: '/images/food/best-shiro.jpg',
    title: 'Shiro Tegabino',
    subtitle: 'Silky spiced chickpea stew simmered in a clay pot, paired with vibrant garden salad',
    tag: 'Vegetarian Delight',
    accent: 'from-emerald-950/80 via-slate-950/60 to-transparent',
  },
  {
    src: '/images/food/kitfo.jpg',
    fallback: '/images/food/beyeayinet.jpg',
    title: 'Kitfo',
    subtitle: 'Ethiopian-style minced beef marinated in mitmita and niter kibbeh — served fresh or lightly cooked',
    tag: 'Premium Cut',
    accent: 'from-red-950/80 via-slate-950/60 to-transparent',
  },
  {
    src: '/images/food/injera.jpg',
    fallback: '/images/food/beyeayinet.jpg',
    title: 'Beyaynetu Feast',
    subtitle: 'A colourful spread of seven traditional Ethiopian wots and vegetable dishes on a single injera platter',
    tag: 'Sharing Platter',
    accent: 'from-yellow-950/80 via-slate-950/60 to-transparent',
  },
  {
    src: '/images/food/special-habesha-siga-tibs.jpg',
    fallback: '/images/food/tibs-with-atklt.jpg',
    title: 'Special Habesha Tibs',
    subtitle: 'Our celebrated house-style tibs with caramelised vegetables, served sizzling at your table',
    tag: 'House Special',
    accent: 'from-rose-950/80 via-slate-950/60 to-transparent',
  },
  {
    src: '/images/food/spris-juice.jpg',
    fallback: '/images/food/food-photo.avif',
    title: 'Spris Layered Juice',
    subtitle: "Vibrant layers of fresh avocado, mango, papaya and strawberry juice — Ethiopia's beloved smoothie",
    tag: 'Beverages',
    accent: 'from-teal-950/80 via-slate-950/60 to-transparent',
  },
];

const INTERVAL_MS = 3000;

// ─── Component ────────────────────────────────────────────────────────────────
interface FoodSliderProps {
  onOpenBookingModal: () => void;
}

export const FoodSlider: React.FC<FoodSliderProps> = ({ onOpenBookingModal }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number, dir: 'next' | 'prev' = 'next') => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  }, [animating]);

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 'next');
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev');
  }, [current, goTo]);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-slate-950"
      style={{ height: 'clamp(320px, 55vw, 620px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Food gallery slider"
    >
      {/* ── Background image ──────────────────────────────────────────── */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className={`
            absolute inset-0 transition-opacity duration-700 ease-in-out
            ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}
          `}
        >
          <img
            src={s.src}
            alt={s.title}
            onError={e => { (e.currentTarget as HTMLImageElement).src = s.fallback; }}
            className={`
              w-full h-full object-cover object-center
              transition-transform duration-[7000ms] ease-out
              ${i === current ? 'scale-110' : 'scale-100'}
            `}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          {/* Gradient overlays */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.accent}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
        </div>
      ))}

      {/* ── Slide content ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-10 sm:pb-14 px-6 sm:px-12 lg:px-16 pointer-events-none">
        {/* Tag pill */}
        <div
          className={`
            mb-3 self-start inline-flex items-center gap-1.5
            px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40
            text-amber-300 text-[11px] font-bold uppercase tracking-widest
            transition-all duration-500
            ${animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}
          `}
        >
          <Utensils className="w-3 h-3" />
          {slide.tag}
        </div>

        {/* Title */}
        <h2
          className={`
            font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white
            leading-tight max-w-lg
            transition-all duration-500 delay-75
            ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
        >
          {slide.title}
        </h2>

        {/* Subtitle */}
        <p
          className={`
            mt-2 text-sm sm:text-base text-slate-300 max-w-md leading-relaxed
            transition-all duration-500 delay-150
            ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
        >
          {slide.subtitle}
        </p>

        {/* CTA button */}
        <div
          className={`
            mt-5 pointer-events-auto
            transition-all duration-500 delay-200
            ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
          `}
        >
          <button
            onClick={onOpenBookingModal}
            className="
              inline-flex items-center gap-2 px-5 py-2.5
              bg-amber-500 hover:bg-amber-400 active:bg-amber-600
              text-slate-950 font-bold text-sm rounded-xl
              shadow-lg shadow-amber-500/30
              transition-all duration-200 cursor-pointer
            "
          >
            <Star className="w-4 h-4" />
            Reserve a Table
          </button>
        </div>
      </div>

      {/* ── Navigation arrows ─────────────────────────────────────────── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="
          absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30
          w-9 h-9 sm:w-11 sm:h-11 rounded-full
          bg-slate-900/60 hover:bg-amber-500 border border-white/10 hover:border-amber-500
          text-white hover:text-slate-950
          flex items-center justify-center
          transition-all duration-200 cursor-pointer
          backdrop-blur-sm
        "
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={next}
        aria-label="Next slide"
        className="
          absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30
          w-9 h-9 sm:w-11 sm:h-11 rounded-full
          bg-slate-900/60 hover:bg-amber-500 border border-white/10 hover:border-amber-500
          text-white hover:text-slate-950
          flex items-center justify-center
          transition-all duration-200 cursor-pointer
          backdrop-blur-sm
        "
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* ── Dot indicators ────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            aria-label={`Go to slide ${i + 1}`}
            className={`
              rounded-full transition-all duration-300 cursor-pointer
              ${i === current
                ? 'w-6 h-2 bg-amber-400'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }
            `}
          />
        ))}
      </div>

      {/* ── Progress bar ──────────────────────────────────────────────── */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 z-30 h-0.5 bg-slate-800/60">
          <div
            key={`${current}-progress`}
            className="h-full bg-amber-500 origin-left"
            style={{
              animation: `slider-progress ${INTERVAL_MS}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* ── Slide counter ─────────────────────────────────────────────── */}
      <div className="absolute top-4 right-5 z-30 text-[11px] font-mono text-white/50">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>

      {/* ── Section label ─────────────────────────────────────────────── */}
      <div className="absolute top-4 left-5 z-30 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-400/80">
        <div className="w-4 h-0.5 bg-amber-400/60" />
        Our Cuisine
        <div className="w-4 h-0.5 bg-amber-400/60" />
      </div>

      {/* Inline keyframe for the progress bar */}
      <style>{`
        @keyframes slider-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </section>
  );
};
