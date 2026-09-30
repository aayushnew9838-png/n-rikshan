import { PremiumNavbar } from '../components/landing/PremiumNavbar';
import { CursorAura } from '../components/landing/CursorAura';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { BeforeAfter } from '../components/landing/BeforeAfter';
import { IntelligencePipeline } from '../components/landing/IntelligencePipeline';
import { IndiaIntelligence } from '../components/landing/IndiaIntelligence';
import { ExplainabilityPreview } from '../components/landing/ExplainabilityPreview';
import { HistoricalMemory } from '../components/landing/HistoricalMemory';
import { DashboardPreview } from '../components/landing/DashboardPreview';
import { FinalCta } from '../components/landing/FinalCta';
import { LandingFooter } from '../components/landing/LandingFooter';
import { useLandingData } from '../components/landing/useLandingData';

export default function Landing() {
  const data = useLandingData();

  return (
    <div className="relative min-h-screen bg-white">
      <a
        href="#intelligence"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to intelligence
      </a>

      <PremiumNavbar />
      <CursorAura />

      <main>
        <HeroSection />
        <ProblemSection />
        <BeforeAfter
          analysis={data.analysis}
          loading={data.analysisLoading}
          unavailable={data.unavailable}
          regionName={data.topRisk?.name ?? null}
          leadDay={data.leadDay}
          onRetry={data.reload}
        />
        <IntelligencePipeline />
        <IndiaIntelligence data={data} />
        <ExplainabilityPreview
          analysis={data.analysis}
          loading={data.analysisLoading}
          unavailable={data.unavailable}
          regionName={data.topRisk?.name ?? null}
          leadDay={data.leadDay}
          onRetry={data.reload}
        />
        <HistoricalMemory
          analysis={data.analysis}
          loading={data.analysisLoading}
          unavailable={data.unavailable}
          regionName={data.topRisk?.name ?? null}
          onRetry={data.reload}
        />
        <DashboardPreview data={data} />
        <FinalCta />
      </main>

      <LandingFooter />
    </div>
  );
}
