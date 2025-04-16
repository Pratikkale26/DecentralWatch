import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { RewardsSection } from "@/components/sections/rewards-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { CtaSection } from "@/components/sections/cta-section"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <Header /> */}
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RewardsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

