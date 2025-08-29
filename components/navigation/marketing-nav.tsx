'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, ArrowRight, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleThemeToggle } from '@/components/ui/simple-theme-toggle-fallback';
import { useMobileDetect } from '@/hooks/use-mobile-detect';

const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export default function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isMobile } = useMobileDetect() || { isMobile: false };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen && isMobile) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, isMobile]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const scrollToSection = (href: string) => {
    if (href.startsWith('#') && typeof document !== 'undefined') {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    handleLinkClick();
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav 
        className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100"
        style={{
          paddingTop: isMobile ? 'max(12px, env(safe-area-inset-top))' : '12px'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 z-50">
              <Shield className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
              <span className="text-lg md:text-xl font-bold text-gray-900">
                TrueCheck<span className="hidden sm:inline">-AI</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.href.startsWith('#') ? (e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  } : undefined}
                  className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <SimpleThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden relative z-50 p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </motion.div>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
            className="fixed right-0 top-0 z-40 h-full w-80 max-w-[85vw] bg-white shadow-2xl md:hidden"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900">TrueCheck-AI</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2"
                aria-label="Close menu"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex-1 overflow-y-auto py-6">
              <div className="space-y-1 px-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={item.href.startsWith('#') ? (e) => {
                      e.preventDefault();
                      scrollToSection(item.href);
                    } : handleLinkClick}
                    className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 font-medium"
                    style={{ minHeight: '48px' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Menu Actions */}
            <div className="border-t p-6 space-y-3">
              <div className="flex justify-center mb-4">
                <SimpleThemeToggle />
              </div>
              <Link href="/login" onClick={handleLinkClick} className="block w-full">
                <Button 
                  variant="outline" 
                  className="w-full justify-center"
                  style={{ minHeight: '48px' }}
                >
                  Login
                </Button>
              </Link>
              
              <Link href="/register" onClick={handleLinkClick} className="block w-full">
                <Button 
                  className="w-full justify-center"
                  style={{ minHeight: '48px' }}
                >
                  Start Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}