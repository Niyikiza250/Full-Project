import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VerseSlide {
  title: string;
  verse: string;
  reference: string;
}

const SLIDES: VerseSlide[] = [
  { title: 'Ijambo ry\'Imana', verse: '"Bagore, mugandukire abagabo banyu nk\'uko mugandukira Umwami."', reference: 'Abefeso 5:22' },
  { title: 'Ijambo ry\'Imana', verse: '"Umugore ufite ubwenge yubaka urugo rwe."', reference: 'Imigani 14:1' },
  { title: 'Ijambo ry\'Imana', verse: '"Imbaraga n\'icyubahiro ni byo mwambaro we."', reference: 'Imigani 31:25' },
  { title: 'Ijambo ry\'Imana', verse: '"Nzamwigisha inzira akwiriye kunyuramo."', reference: 'Zaburi 32:8' },
  { title: 'Ijambo ry\'Imana', verse: '"Ibyiringiro biri mu Mana ntibiteza isoni."', reference: 'Abaroma 5:5' },
];

export const BibleVerseSlideshow: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(next, 5000);
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [paused, next]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    el.addEventListener('keydown', onKey);
    el.setAttribute('tabindex', '0');
    return () => el.removeEventListener('keydown', onKey);
  }, [prev, next]);

  const slide = SLIDES[current];

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto select-none outline-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative min-h-[200px] sm:min-h-[220px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-sda-gold-light mb-3">
              <span className="h-px w-5 bg-sda-gold/40" />
              {slide.title}
              <span className="h-px w-5 bg-sda-gold/40" />
            </span>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-relaxed italic max-w-lg drop-shadow-sm">
              {slide.verse}
            </p>
            <p className="mt-3 text-xs font-semibold text-white/60">
              — {slide.reference}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 md:opacity-60"
        aria-label="Previous verse"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 md:opacity-60"
        aria-label="Next verse"
      >
        <ChevronRight size={16} />
      </button>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-sda-gold-light shadow-[0_0_8px_rgba(212,198,122,0.6)]' : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Pause indicator */}
      {paused && (
        <span className="absolute top-0 right-0 text-[9px] font-bold text-white/40 uppercase tracking-wider">
          Paused
        </span>
      )}
    </div>
  );
};
