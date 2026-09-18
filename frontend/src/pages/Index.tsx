import Layout from '@/components/Layout';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureBlocks from '@/components/FeatureBlocks';
import ValueProposition from '@/components/ValueProposition';
import CallToAction from '@/components/CallToAction';
import { useTranslation } from 'react-i18next';
import EducationMosaicBackground from '@/components/EducationMosaicBackground';
import SectionDivider from '@/components/SectionDivider';

const Index = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <EducationMosaicBackground />
      {/* Navigation */}
      <Navbar />
      <main>
        <HeroSection />
        <FeatureBlocks />
        <ValueProposition />
        <CallToAction />

<section className="pt-8 pb-24 md:pb-40 relative text-center snap-start snap-always">
            {/* Section-tinted scrim over the global mosaic — mixed accent */}
          <div className="absolute inset-0 -z-10 bg-[#180528]/60" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F743EE]/[0.04] via-[#8B11D1]/[0.04] to-[#4BC6B9]/[0.04]" />

          <SectionDivider position="top" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center mt-16 md:mt-24">
            <p className="font-body text-sm md:text-base text-white/40 mb-10 max-w-xl select-none uppercase tracking-[0.2em] font-semibold">
              {t('partner.text')}
            </p>
            <a href="https://tokenconsulting.group/" target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity duration-500 opacity-50 hover:opacity-90">
              <img
                src="/images/TGC.webp"
                alt="Token Consulting Group"
                loading="lazy"
                width={400}
                height={150}
                className="h-20 sm:h-24 object-contain"
              />
            </a>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Index;