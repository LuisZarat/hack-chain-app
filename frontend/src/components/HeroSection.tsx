import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SectionDivider from '@/components/SectionDivider';

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
className="min-h-screen flex items-center relative pt-28 sm:pt-32 snap-start snap-always"    >
      <SectionDivider position="top" />

      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-10 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-4 xl:gap-8">

          <motion.div
            className="flex-1 min-w-0 flex flex-col items-center text-center lg:items-start lg:text-left relative"
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.1 }}
          >
            <h1 className="font-title text-7xl sm:text-8xl md:text-9xl lg:text-8xl xl:text-9xl font-black mb-10 leading-[0.95] tracking-tight flex flex-col gap-1">
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

            <div className="flex items-start gap-5 max-w-3xl lg:max-w-4xl xl:max-w-5xl">
              <div className="hidden sm:block w-2 self-stretch rounded-full bg-gradient-to-b from-[#F743EE] via-[#8B11D1] to-[#4BC6B9] shrink-0 mt-1 shadow-[0_0_20px_rgba(139,17,209,0.5)]" />
              <p className="font-title text-2xl sm:text-3xl md:text-3xl lg:text-4xl text-white/90 font-bold leading-tight tracking-tight whitespace-pre-line">
                {t('hero.subTitle1')}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="flex-1 min-w-0 flex flex-col items-center justify-center w-full relative"
            initial={{ opacity: 0, x: 32, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 70, damping: 18, delay: 0.25 }}
          >
            <Suspense
              fallback={
                <div className="w-full aspect-square flex items-center justify-center relative z-10">
                  <div className="w-14 h-14 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                </div>
              }
            >
              <div className="w-full aspect-square relative z-10">
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