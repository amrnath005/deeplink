"use client";

import { useLenis } from "@/hooks/useLenis";
import { CustomCursor } from "@/components/animations/CustomCursor";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { LinkGenerator } from "@/components/sections/LinkGenerator";
import { Features } from "@/components/sections/Features";
import { TelemetryPipeline3D } from "@/components/sections/TelemetryPipeline3D";
import { SupportedApps } from "@/components/sections/SupportedApps";
import { Statistics } from "@/components/sections/Statistics";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { Pricing } from "@/components/sections/Pricing";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  useLenis();
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden radial-ambient-light">
      <CustomCursor />
      <Navbar />
      <Hero />
      <LinkGenerator />
      <Features />
      <TelemetryPipeline3D />
      <SupportedApps />
      <Statistics />
      <HowItWorks />
      <DashboardPreview />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  );
}
