'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ButtonV2 as Button } from '@/components/ui/button-v2';
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
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  badge?: string | number;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
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

const quickActions: QuickAction[] = [
  {
    label: 'Quick Analysis',
    icon: Zap,
    onClick: () => console.log('Quick analysis'),
    variant: 'primary',
  },
  {
    label: 'Support',
    icon: HelpCircle,
    onClick: () => console.log('Help'),
    variant: 'secondary',
  },
];

export function SidebarV2({ 
  isCollapsed = false, 
  onToggleCollapse,
  className 
}: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 72 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  };

  return (
    <motion.aside
      variants={sidebarVariants}
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col',
        'bg-white/95 backdrop-blur-xl border-r border-gray-200/60',
        'shadow-xl shadow-gray-900/5',
        'dark:bg-gray-950/95 dark:border-gray-800/60',
        className
      )}
    >
      {/* Header Section */}
      <div className="flex-none p-6 pb-4">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                key="logo-expanded"
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <Shield className="w-8 h-8 text-blue-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                </div>
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
          </AnimatePresence>
          
          {isCollapsed && (
            <Shield className="w-8 h-8 text-blue-500 mx-auto" />
          )}
          
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn(
                'p-1.5 h-auto hover:bg-neutral-100 dark:hover:bg-neutral-800',
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
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.2, delay: 0.1 }}
              className="mt-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 text-sm',
                    'bg-neutral-50 border border-neutral-200 rounded-xl',
                    'focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500',
                    'dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
                  'text-sm font-medium transition-all duration-200',
                  'group hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
                  isActive && [
                    'bg-brand-50 text-brand-700 shadow-sm',
                    'dark:bg-brand-950/50 dark:text-brand-300',
                    'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2',
                    'before:w-1 before:h-6 before:bg-brand-500 before:rounded-r-full'
                  ],
                  !isActive && 'text-neutral-600 dark:text-neutral-400',
                  isCollapsed && 'justify-center px-2'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  'group-hover:scale-110',
                  isActive && 'text-brand-600 dark:text-brand-400'
                )} />
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between flex-1 min-w-0"
                    >
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          'bg-accent-100 text-accent-700',
                          'dark:bg-accent-900/50 dark:text-accent-300'
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Active indicator for collapsed state */}
                {isCollapsed && isActive && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-brand-500 rounded-full" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>
      
      {/* Quick Actions Section */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{ duration: 0.2 }}
            className="px-4 pb-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Sparkles className="w-4 h-4 text-accent-500" />
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                  Ações Rápidas
                </span>
              </div>
              
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant={action.variant === 'primary' ? 'solid' : 'ghost'}
                    size="sm"
                    onClick={action.onClick}
                    className="w-full justify-start gap-3 h-9"
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* User Profile Section */}
      <div className="flex-none p-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 border-2 border-white dark:border-neutral-950 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <Bell className="w-4 h-4 text-neutral-400 hover:text-brand-500 transition-colors" />
              </div>
              
              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full justify-start gap-3 text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 dark:hover:bg-error-950/50"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 border-2 border-white dark:border-neutral-950 rounded-full" />
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="p-2 text-error-600 hover:text-error-700 hover:bg-error-50 dark:text-error-400 dark:hover:text-error-300 dark:hover:bg-error-950/50"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}

export default SidebarV2;