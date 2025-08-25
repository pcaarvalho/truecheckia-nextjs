'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  History, 
  User, 
  Settings,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  BarChart3,
  Bell,
  HelpCircle
} from 'lucide-react';

interface SimpleSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const navigationItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/analysis',
    label: 'New Analysis',
    icon: FileText,
  },
  {
    href: '/history',
    label: 'History',
    icon: History,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    badge: 'Pro',
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function SimpleSidebar({ 
  isCollapsed = false, 
  onToggleCollapse,
  onLogout,
  className 
}: SimpleSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  const handleQuickAnalysis = () => {
    router.push('/analysis');
  };

  const handleSupport = () => {
    router.push('/contact');
  };

  const handleAnalyticsClick = async (e: React.MouseEvent, item: NavItem) => {
    // If the item has a PRO badge and user is not on PRO plan, redirect to checkout
    if (item.badge === 'Pro' && user?.plan !== 'PRO' && user?.plan !== 'ENTERPRISE') {
      e.preventDefault();
      setIsLoadingCheckout(true);
      
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: 'PRO',
            interval: 'monthly',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const data = await response.json();
        
        if (data.data?.url) {
          // Redirect to Stripe Checkout
          window.location.href = data.data.url;
        } else {
          console.error('No checkout URL received');
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        alert('Failed to create checkout session. Please try again.');
      } finally {
        setIsLoadingCheckout(false);
      }
    }
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col',
        'bg-white/95 backdrop-blur-xl border-r border-gray-200',
        'shadow-xl shadow-gray-900/5',
        'dark:bg-gray-900/95 dark:border-gray-800',
        className
      )}
    >
      {/* Header Section */}
      <div className="flex-none p-6 pb-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  TrueCheckIA
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  v2.0 Pro
                </p>
              </div>
            </motion.div>
          )}
          
          {isCollapsed && (
            <Shield className="w-8 h-8 text-blue-500 mx-auto" />
          )}
          
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn(
                'p-1.5 h-auto hover:bg-gray-100 dark:hover:bg-gray-800',
                isCollapsed && 'mx-auto mt-2'
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        
        {/* Search Bar */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 text-sm',
                  'bg-gray-50 border border-gray-200 rounded-xl',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
                  'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200',
                  'transition-all duration-200'
                )}
              />
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Navigation Section */}
      <nav className="flex-1 px-4 pb-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (item.badge === 'Pro') {
                    handleAnalyticsClick(e, item);
                  } else {
                    router.push(item.href);
                  }
                }}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left',
                  'text-sm font-medium transition-all duration-200',
                  'group hover:bg-gray-100 dark:hover:bg-gray-800/50',
                  isActive && [
                    'bg-blue-50 text-blue-700 shadow-sm',
                    'dark:bg-blue-950/50 dark:text-blue-300',
                    'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                    'before:w-1 before:h-6 before:bg-blue-500 before:rounded-r-full'
                  ],
                  !isActive && 'text-gray-600 dark:text-gray-400',
                  isCollapsed && 'justify-center px-2',
                  isLoadingCheckout && item.badge === 'Pro' && 'opacity-50 cursor-wait'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  'group-hover:scale-110',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )} />
                
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Active indicator for collapsed state */}
                {isCollapsed && isActive && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </button>
            </motion.div>
          );
        })}
      </nav>
      
      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Quick Actions
              </span>
            </div>
            
            <Button 
              variant="default" 
              size="sm" 
              className="w-full justify-start gap-3 h-9 hover:shadow-md transition-all"
              onClick={handleQuickAnalysis}
            >
              <Zap className="w-4 h-4" />
              Quick Analysis
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-3 h-9 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all"
              onClick={handleSupport}
            >
              <HelpCircle className="w-4 h-4" />
              Support
            </Button>
          </div>
        </div>
      )}
      
      {/* User Profile Section */}
      <div className="flex-none p-4 border-t border-gray-200 dark:border-gray-800">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || user?.email || 'User'}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
              <Bell className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
            </div>
            
            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout || logout}
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout || logout}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

export default SimpleSidebar;