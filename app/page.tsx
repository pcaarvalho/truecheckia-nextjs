import { Metadata } from 'next'
import Header from '@/components/layout/header/header'
import Hero from '@/components/features/marketing/hero'
import Features from '@/components/features/marketing/features'
import Footer from '@/components/layout/footer/footer'

export const metadata: Metadata = {
  title: 'TrueCheckIA - AI Content Detector | 95% Accuracy',
  description: 'Detect AI-generated content with 95% accuracy. Advanced AI detection technology trusted by 10,000+ professionals. Try free - no credit card required.',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        {/* TODO: Add other marketing sections like HowItWorks, Pricing, FAQ, etc. */}
      </main>
      <Footer />
    </div>
  )
}