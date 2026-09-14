import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const GlobeViz = lazy(() => import('@/components/GlobeViz'));

const HeroSection = () => {
  const { t } = useTranslation();
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen flex items-center relative pt-28 sm:pt-32"
    >
      {/* Decorative background layer — clipped separately so it never affects the globe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[#F743EE]/[0.08] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8B11D1]/[0.10] rounded-full blur-[160px]" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#4BC6B9]/[0.07] rounded-full blur-[130px]" />

        {/* Subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Floating decorative rings */}
        <div className="absolute top-20 left-[8%] w-24 h-24 rounded-full border border-white/[0.06] hidden lg:block" />
        <div className="absolute bottom-24 left-[15%] w-16 h-16 rounded-full border border-[#F743EE]/20 hidden lg:block" />
        <div className="absolute top-1/3 right-[6%] w-32 h-32 rounded-full border border-[#4BC6B9]/15 hidden lg:block" />

        {/* Floating dots */}
        <span className="absolute top-[18%] left-[45%] w-1.5 h-1.5 rounded-full bg-[#F743EE]/60 hidden lg:block" />
        <span className="absolute bottom-[28%] left-[6%] w-2 h-2 rounded-full bg-[#8B11D1]/50 hidden lg:block" />
        <span className="absolute top-[12%] right-[20%] w-1.5 h-1.5 rounded-full bg-[#4BC6B9]/60 hidden lg:block" />

        {/* Diagonal accent line */}
        <div className="absolute top-0 left-1/2 w-px h-40 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
      </div>

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-10 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-4 xl:gap-8">

          <motion.div
            className="flex-1 min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left relative"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
          >
            {/* Small accent bracket above title */}
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <div className="w-8 h-px bg-gradient-to-r from-[#F743EE] to-[#4BC6B9]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B11D1]" />
            </div>

            <h1 className="font-title text-6xl sm:text-7xl md:text-8xl lg:text-7xl xl:text-8xl font-black mb-10 leading-[0.95] tracking-tight flex flex-col gap-1">
              <span className="text-[#F743EE] drop-shadow-[0_0_24px_rgba(247,67,238,0.4)]">
                {t('hero.title1')}
              </span>
              <span className="text-[#8B11D1] drop-shadow-[0_0_24px_rgba(139,17,209,0.4)]">
                {t('hero.title2')}
              </span>
              <span className="text-[#4BC6B9] drop-shadow-[0_0_24px_rgba(75,198,185,0.4)]">
                {t('hero.title3')}
              </span>
            </h1>

            <div className="flex items-start gap-5 max-w-3xl">
              <div className="hidden sm:block w-1.5 self-stretch rounded-full bg-gradient-to-b from-[#F743EE] via-[#8B11D1] to-[#4BC6B9] shrink-0 mt-1 shadow-[0_0_20px_rgba(139,17,209,0.5)]" />
              <p className="font-title text-3xl sm:text-4xl md:text-5xl text-white/90 font-bold leading-tight tracking-tight">
                {t('hero.subTitle1')}
              </p>
            </div>

            {/* Decorative corner bracket, bottom-left of text block */}
            <div className="hidden lg:block absolute -bottom-10 left-0 w-20 h-20 border-b-2 border-l-2 border-white/[0.06] rounded-bl-3xl" />
          </motion.div>

          <motion.div
            className="flex-1 min-w-0 flex flex-col items-center justify-center w-full relative"
            initial={{ opacity: 0, x: 32, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.25 }}
          >
            {/* Halo glow directly behind the globe */}
            <div className="absolute w-[90%] aspect-square max-w-[560px] rounded-full bg-gradient-to-br from-[#8B11D1]/25 via-[#F743EE]/10 to-[#4BC6B9]/15 blur-[100px] pointer-events-none" />

            {/* Orbit ring decoration around globe */}
            <div className="absolute w-[80%] aspect-square max-w-[500px] rounded-full border border-white/[0.08] pointer-events-none" />
            <div className="absolute w-[92%] aspect-square max-w-[580px] rounded-full border border-dashed border-white/[0.05] pointer-events-none" />

            <Suspense
              fallback={
                <div className="w-full aspect-square max-w-[560px] flex items-center justify-center relative z-10">
                  <div className="w-14 h-14 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                </div>
              }
            >
              <div className="w-full aspect-square max-w-[560px] relative z-10">
                <GlobeViz mobile={!isDesktop} />
              </div>
            </Suspense>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;