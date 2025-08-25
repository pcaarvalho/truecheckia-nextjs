'use client'

import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/ui/card';
import { Shield, Zap, Users, ArrowRight } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-neutral-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why choose 
            <span className="text-gradient-primary">TrueCheckIA</span>?
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Cutting-edge technology for precise AI content detection with unmatched security and speed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Shield className="w-8 h-8" />}
            title="Total Security"
            description="Your data is processed with maximum security and guaranteed privacy. Cutting-edge encryption and GDPR compliance."
            action={
              <Button variant="ghost" size="sm" className="mt-4">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
            className="animate-slide-in"
          />
          
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Instant Analysis"
            description="Precise results in seconds. Real-time analysis with cutting-edge AI for maximum efficiency and productivity."
            action={
              <Button variant="ghost" size="sm" className="mt-4">
                View Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
            className="animate-slide-in-delayed"
          />
          
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="Advanced Collaboration"
            description="Work as a team with advanced collaboration tools. Share analysis and manage projects in real time."
            action={
              <Button variant="ghost" size="sm" className="mt-4">
                Explore
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            }
            className="animate-slide-in"
          />
        </div>
      </div>
    </section>
  );
}