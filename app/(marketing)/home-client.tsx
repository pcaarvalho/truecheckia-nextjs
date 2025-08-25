'use client'

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, Users, Check, Star, ArrowRight, TrendingUp, Activity, Globe, LogOut } from 'lucide-react';
import Link from 'next/link';

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

const FeatureCard = ({ icon, title, description, action, className = "" }: FeatureCardProps) => (
  <Card className={`h-full hover:shadow-lg transition-shadow ${className}`}>
    <CardHeader>
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
    {action && <CardFooter>{action}</CardFooter>}
  </Card>
);

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  variant?: 'default' | 'glass';
  className?: string;
}

const StatsCard = ({ title, value, description, icon, trend, trendValue, variant = "default", className = "" }: StatsCardProps) => (
  <Card className={`${className} ${variant === 'glass' ? 'bg-white/10 backdrop-blur-lg border-white/20' : ''}`}>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {trend && (
        <div className={`flex items-center mt-2 text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
          {trendValue}
        </div>
      )}
    </CardContent>
  </Card>
);

export default function HomeClient() {
  const handleClearSessionAndLogin = async () => {
    try {
      // Clear session via API
      await fetch('/api/auth/force-logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear any local storage tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error clearing session:', error);
      // Redirect anyway
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Shield className="w-8 h-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">TrueCheck-AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Pricing
            </a>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Desktop CTAs */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-blue-50 transition-colors">
              <Link href="/login">
                Login
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/register?plan=PRO">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Detect AI Content with
              <span className="text-yellow-300 block md:inline"> Total Precision</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Advanced AI-generated content detection platform. 
              Protect your organization with precise and reliable analysis using our cutting-edge technology.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/register?plan=PRO">
                <Zap className="w-5 h-5 mr-2" />
                Start for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleClearSessionAndLogin}
              className="border-white/30 text-white hover:bg-white hover:text-blue-600"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Clear Session & Login
            </Button>
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
              trend="up"
              trendValue="Constantly expanding"
              variant="glass"
              className="text-white border-white/20"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-neutral-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why choose <span className="text-blue-600">TrueCheckIA</span>?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Cutting-edge technology for precise AI content detection with unmatched security and speed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-blue-600" />}
              title="Total Security"
              description="Your data is processed with maximum security and guaranteed privacy. Cutting-edge encryption and GDPR compliance."
              action={
                <Button variant="ghost" size="sm" className="mt-4">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
            
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-blue-600" />}
              title="Instant Analysis"
              description="Precise results in seconds. Real-time analysis with cutting-edge AI for maximum efficiency and productivity."
              action={
                <Button variant="ghost" size="sm" className="mt-4">
                  View Demo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
            
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-blue-600" />}
              title="Advanced Collaboration"
              description="Work as a team with advanced collaboration tools. Share analysis and manage projects in real time."
              action={
                <Button variant="ghost" size="sm" className="mt-4">
                  Explore
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              }
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose the ideal plan for you
            </h2>
            <p className="text-xl text-muted-foreground">
              Transparent pricing and powerful features
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Free</CardTitle>
                <CardDescription className="text-gray-700 mt-2">
                  Perfect to start and test our platform
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">Free</span>
                  </div>
                  <p className="text-blue-600 font-medium mt-2">10 analyses/month</p>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">10 analyses per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Basic analyses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Email support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">30-day history</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button className="w-full" variant="outline" size="lg" asChild>
                  <Link href="/register?plan=FREE">
                    Start Free
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-blue-400 shadow-lg scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3" />
                  Most Popular
                </div>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                <CardDescription className="text-gray-700 mt-2">
                  Ideal for professionals and small teams
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">$19</span>
                    <span className="text-gray-700">/month</span>
                  </div>
                  <p className="text-blue-600 font-medium mt-2">1,000 analyses/month</p>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">1,000 analyses per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Advanced analyses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">API access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Complete history</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Multi-language detection</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg" 
                  asChild
                >
                  <Link href="/register?plan=PRO">
                    Start Pro Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">Enterprise</CardTitle>
                <CardDescription className="text-gray-700 mt-2">
                  For companies that need personalized solutions
                </CardDescription>
                <div className="mt-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">Custom</span>
                  </div>
                  <p className="text-blue-600 font-medium mt-2">Unlimited credits</p>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Unlimited analyses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">All features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Dedicated support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Guaranteed SLA</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Team management</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="px-6 pb-6">
                <Button className="w-full" variant="outline" size="lg" asChild>
                  <Link href="/contact">
                    Contact Sales
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to revolutionize your content analysis?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust TrueCheckIA to protect and validate their content
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              asChild
            >
              <Link href="/register?plan=FREE">
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent text-white border-white/30 hover:bg-white hover:text-blue-600" 
              asChild
            >
              <Link href="/register?plan=PRO">
                Test Pro for 14 days
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold">TrueCheck-AI</span>
              </div>
              <p className="text-gray-400">
                Advanced AI content detection platform for businesses and educators.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TrueCheckIA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}