import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/dashboard/logout-button';
import { 
  Shield, 
  LayoutDashboard, 
  FileText, 
  History, 
  User, 
  Settings,
  Menu
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">TrueCheck-AI</span>
          </Link>
        </div>

        <nav className="px-6 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link
            href="/analysis"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <FileText className="w-5 h-5" />
            <span>New Analysis</span>
          </Link>
          
          <Link
            href="/history"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <History className="w-5 h-5" />
            <span>History</span>
          </Link>
          
          <Link
            href="/profile"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          
          <Link
            href="/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}