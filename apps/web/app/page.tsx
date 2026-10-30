import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { MetricsTicker } from "@/components/landing/metrics-ticker";
import { FeatureBento } from "@/components/landing/feature-bento";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TerminalPreview } from "@/components/landing/terminal-preview";
import { PricingMatrix } from "@/components/landing/pricing-matrix";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branchy — Git-Powered Financial Runway & DAG Ledger",
  description:
    "Branch spending scenarios, calculate timeline diffs, and project cash flow without mutating the main financial history. 100% deterministic, zero AI baggage.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MetricsTicker />
        <FeatureBento />
        <HowItWorks />
        <TerminalPreview />
        <PricingMatrix />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
