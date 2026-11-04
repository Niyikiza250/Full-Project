import React, { useEffect, useCallback, useState, useRef } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useHeroStore } from '@/store/useHeroStore';
import { cn } from '@/lib/utils';
import EmailSubscription from './EmailSubscription';

interface ExpandableDescriptionProps {
  text: string;
  onToggle: (isExpanded: boolean) => void;
}

const ExpandableDescription: React.FC<ExpandableDescriptionProps> = ({ text, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    onToggle(next);
  };

  return (
    <div className="space-y-2 sm:space-y-2.5">
      <motion.div
        animate={{ height: isExpanded ? 'auto' : '2.8em' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <p
          className={cn(
            'text-xs sm:text-sm md:text-base text-white/95 max-w-xl font-medium leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.9),0_2px_6px_rgba(0,0,0,0.7)] transition-all',
            !isExpanded && 'line-clamp-2'
          )}
        >
          {text}
        </p>
      </motion.div>
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-sda-gold hover:text-sda-gold-light transition-colors uppercase tracking-wider bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/15 cursor-pointer"
      >
        {isExpanded ? (
          <>Show Less <ChevronUp size={12} /></>
        ) : (
          <>Read More <ChevronDown size={12} /></>
        )}
      </button>
    </div>
  );
};

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.05,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0, ease: EASE_OUT } satisfies Transition,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0, ease: EASE_OUT } satisfies Transition,
  }),
};

const HeroSlider: React.FC = () => {
  const fetchSlides = useHeroStore((s) => s.fetchSlides);
  const initialized = useHeroStore((s) => s.initialized);
  const slides = useHeroStore(useShallow((s) => s.slides.filter((slide) => slide.active !== false)));

  useEffect(() => {
    if (!initialized) fetchSlides();
  }, [fetchSlides, initialized]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchSlides();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [fetchSlides]);

  const [[current, direction], setCurrent] = useState<[number, number]>([0, 0]);
  const pausedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paginate = useCallback(
    (dir: number) => {
      if (slides.length <= 1) return;
      setCurrent(([prev]) => {
        const next = (prev + dir + slides.length) % slides.length;
        return [next, dir];
      });
    },
    [slides.length],
  );

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) paginate(1);
    }, 6000);
  }, [paginate]);

  useEffect(() => {
    if (slides.length > 1) startAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slides.length, startAutoplay]);

  const handleDescriptionToggle = useCallback((isExpanded: boolean) => {
    pausedRef.current = isExpanded;
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      const dir = idx > current ? 1 : -1;
      setCurrent([idx, dir]);
      if (slides.length > 1) startAutoplay();
    },
    [current, slides.length, startAutoplay],
  );

  if (!initialized) {
    return (
      <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-neutral-900">
        <Loader2 size={40} className="animate-spin text-sda-gold" />
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center bg-neutral-900">
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-[1.05] tracking-tight">
            Welcome to MIFEM
          </h1>
          <p className="mt-2 sm:mt-4 text-xs sm:text-base text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
            Stay tuned for updates.
          </p>
        </div>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative w-full min-h-[100dvh] overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Background Image — full bleed, covers entire section */}
          {slide.bgImage && (
            <img
              src={slide.bgImage}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover object-[center_30%] sm:object-center select-none pointer-events-none brightness-105 contrast-[1.02] saturate-110 transition-transform duration-700"
            />
          )}

          {/* Soft ambient scrim — keeps the image vibrant while ensuring text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/65 via-black/35 to-black/5 sm:from-black/70 sm:via-black/30 sm:to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none" />

          {/* Content */}
          <div className="relative z-20 flex flex-col items-start justify-center w-full h-full min-h-[100dvh] px-4 sm:px-8 md:px-12 lg:px-16 xl:px-24 pt-16 pb-44 sm:pb-36 lg:pb-20">
            <div className="w-full max-w-sm sm:max-w-lg lg:max-w-xl text-left space-y-3 sm:space-y-4 rounded-2xl bg-black/30 sm:bg-black/25 border border-white/10 px-4 py-4 sm:px-6 sm:py-5 backdrop-blur-[2px] shadow-xl">
              <div className="space-y-2 sm:space-y-3">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0 }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-snug sm:leading-tight tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.9),0_4px_12px_rgba(0,0,0,0.8)]"
                >
                  {slide.title}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0, duration: 0 }}
                >
                  <ExpandableDescription
                    text={slide.description}
                    onToggle={handleDescriptionToggle}
                  />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0, duration: 0 }}
                className="flex items-center gap-3 pt-1"
              >
                <Link
                  to={slide.primaryCta.href}
                  className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-sda-gold hover:bg-sda-gold-light px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-sda-blue shadow-xl shadow-sda-gold/25 hover:shadow-sda-gold/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
                >
                  {slide.primaryCta.label}
                  <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Email subscription — positioned bottom-right */}
      <div className="absolute bottom-11 sm:bottom-9 right-3 sm:right-8 lg:right-12 xl:right-16 left-3 sm:left-auto z-30 max-w-xs sm:max-w-sm lg:max-w-md w-[calc(100%-1.5rem)] sm:w-full">
        <EmailSubscription />
      </div>

      {/* Pagination dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={cn(
                'transition-all duration-300 rounded-full cursor-pointer',
                i === current
                  ? 'w-8 h-2.5 bg-sda-gold shadow-lg shadow-sda-gold/40'
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      )}

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => { paginate(-1); if (slides.length > 1) startAutoplay(); }}
            className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-xl cursor-pointer active:scale-90"
          >
            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => { paginate(1); if (slides.length > 1) startAutoplay(); }}
            className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-xl cursor-pointer active:scale-90"
          >
            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
          </button>
        </>
      )}
    </section>
  );
};

export default HeroSlider;
