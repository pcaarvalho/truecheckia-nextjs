'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
          <Card className="animate-slide-in">
            <CardHeader>
              <Shield className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Total Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your data is processed with maximum security and guaranteed privacy. Cutting-edge encryption and GDPR compliance.
              </CardDescription>
              <Button variant="ghost" size="sm" className="mt-4">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-in-delayed">
            <CardHeader>
              <Zap className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Instant Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Precise results in seconds. Real-time analysis with cutting-edge AI for maximum efficiency and productivity.
              </CardDescription>
              <Button variant="ghost" size="sm" className="mt-4">
                View Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
          
          <Card className="animate-slide-in">
            <CardHeader>
              <Users className="w-8 h-8 mb-2 text-primary" />
              <CardTitle>Advanced Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Work as a team with advanced collaboration tools. Share analysis and manage projects in real time.
              </CardDescription>
              <Button variant="ghost" size="sm" className="mt-4">
                Explore
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}