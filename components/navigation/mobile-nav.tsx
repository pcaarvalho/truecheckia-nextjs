'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Shield, 
  LayoutDashboard, 
  FileText, 
  History, 
  User, 
  Settings,
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    href: '/analysis',
    icon: FileText,
    label: 'New Analysis'
  },
  {
    href: '/history',
    icon: History,
    label: 'History'
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profile'
  },
  {
    href: '/settings',
    icon: Settings,
    label: 'Settings'
  }
];

interface MobileNavProps {
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export default function MobileNav({ isAuthenticated = true, onLogout }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden relative z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
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

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300 
            }}
            className="fixed left-0 top-0 z-50 h-full w-80 bg-white shadow-2xl md:hidden"
            style={{
              // Safe area support for devices with notches
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <Link 
                href="/" 
                className="flex items-center space-x-2"
                onClick={handleLinkClick}
              >
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">TrueCheck-AI</span>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-6">
              {isAuthenticated ? (
                <div className="space-y-2 px-6">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                        style={{ 
                          // Ensure touch targets are at least 44px high
                          minHeight: '44px' 
                        }}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-4 px-6">
                  <Link
                    href="/login"
                    onClick={handleLinkClick}
                    className="block w-full"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full justify-center py-3 text-base"
                      style={{ minHeight: '44px' }}
                    >
                      Login
                    </Button>
                  </Link>
                  
                  <Link
                    href="/register"
                    onClick={handleLinkClick}
                    className="block w-full"
                  >
                    <Button 
                      className="w-full justify-center py-3 text-base"
                      style={{ minHeight: '44px' }}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {isAuthenticated && (
              <div className="border-t p-6">
                <Button
                  variant="ghost"
                  onClick={onLogout}
                  className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  style={{ minHeight: '44px' }}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </Button>
              </div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}