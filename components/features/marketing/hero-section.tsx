'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
            size="lg" 
            variant="default"
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
              size="lg" 
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
          <Card className="text-white border-white/20 bg-white/10">
            <CardHeader className="pb-2">
              <Activity className="w-6 h-6 mb-2" />
              <CardTitle className="text-2xl">2.5M+</CardTitle>
              <CardDescription className="text-white/80">Analyses Performed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">Documents analyzed with precision</p>
              <p className="text-sm text-green-300 mt-1">+23% this month</p>
            </CardContent>
          </Card>
          <Card className="text-white border-white/20 bg-white/10">
            <CardHeader className="pb-2">
              <TrendingUp className="w-6 h-6 mb-2" />
              <CardTitle className="text-2xl">99.2%</CardTitle>
              <CardDescription className="text-white/80">Precision</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">Verified detection rate</p>
              <p className="text-sm text-green-300 mt-1">Best in category</p>
            </CardContent>
          </Card>
          <Card className="text-white border-white/20 bg-white/10">
            <CardHeader className="pb-2">
              <Globe className="w-6 h-6 mb-2" />
              <CardTitle className="text-2xl">50+</CardTitle>
              <CardDescription className="text-white/80">Languages</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">Multilingual support</p>
              <p className="text-sm text-gray-300 mt-1">Constantly expanding</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}