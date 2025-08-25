'use client'

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-cosmic relative overflow-hidden">
      <div className="absolute inset-0 animate-gradient-x opacity-50"></div>
      <div className="relative container mx-auto px-4 text-center text-white">
        <div className="animate-fade-in">
          <h2 className="text-4xl font-bold mb-4">
            Ready to revolutionize your content analysis?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust TrueCheckIA to protect and validate their content
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-delayed">
          <Button 
            size="xl" 
            variant="glass" 
            asChild
            className="group interactive-scale text-lg shadow-glow-lg"
          >
            <Link href="/register?plan=FREE">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button 
            size="xl" 
            variant="outline" 
            className="bg-transparent text-white border-white/30 hover:bg-white hover:text-brand-primary-600 interactive-scale" 
            asChild
          >
            <Link href="/register?plan=PRO">
              Test Pro for 14 days
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}