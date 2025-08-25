'use client'

import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/card';
import { Zap, ArrowRight, LogOut, Activity, TrendingUp, Globe } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  onClearSessionAndLogin?: () => void;
}

export default function HeroSection({ onClearSessionAndLogin }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-primary py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cosmic opacity-30"></div>
      <div className="relative container mx-auto px-4 text-center text-white">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Detect AI Content with
            <span className="text-gradient-cosmic block md:inline"> Total Precision</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-generated content detection platform. 
            Protect your organization with precise and reliable analysis using our cutting-edge technology.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-delayed">
          <Button 
            asChild 
            size="xl" 
            variant="glass"
            className="group interactive-scale text-lg shadow-glow"
          >
            <Link href="/register?plan=PRO">
              <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start for Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          {onClearSessionAndLogin && (
            <Button 
              variant="outline" 
              size="xl" 
              onClick={onClearSessionAndLogin}
              className="group border-white/30 text-white hover:bg-white hover:text-brand-primary-600 interactive-scale"
            >
              <LogOut className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Clear Session & Login
            </Button>
          )}
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <StatsCard 
            title="Analyses Performed" 
            value="2.5M+" 
            description="Documents analyzed with precision"
            icon={<Activity className="w-6 h-6" />}
            trend="up"
            trendValue="+23% this month"
            variant="glass"
            className="text-white border-white/20"
          />
          <StatsCard 
            title="Precision" 
            value="99.2%" 
            description="Verified detection rate"
            icon={<TrendingUp className="w-6 h-6" />}
            trend="up"
            trendValue="Best in category"
            variant="glass"
            className="text-white border-white/20"
          />
          <StatsCard 
            title="Languages" 
            value="50+" 
            description="Multilingual support"
            icon={<Globe className="w-6 h-6" />}
            trend="neutral"
            trendValue="Constantly expanding"
            variant="glass"
            className="text-white border-white/20"
          />
        </div>
      </div>
    </section>
  );
}