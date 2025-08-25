'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Trash2, 
  Globe, 
 
  Sun,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDangerLoading, setIsDangerLoading] = useState(false);
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailAnalysisComplete: true,
    emailCreditsLow: true,
    emailWeeklyReport: false,
    emailMarketingUpdates: false,
    pushNotifications: true,
    desktopNotifications: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    dataRetention: '12months',
    analyticsTracking: true,
    thirdPartyIntegrations: false,
    publicProfile: false
  });

  // Language and region
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'auto',
    dateFormat: 'MM/dd/yyyy',
    analysisLanguage: 'auto'
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement settings save API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Error saving settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data, including analysis history.'
    );
    
    if (!confirmation) return;

    const doubleConfirmation = window.confirm(
      'This is your final warning. Type "DELETE" in the next dialog to confirm account deletion.'
    );
    
    if (!doubleConfirmation) return;

    const finalConfirmation = window.prompt(
      'Type "DELETE" exactly as shown to confirm account deletion:'
    );
    
    if (finalConfirmation !== 'DELETE') {
      toast.error('Account deletion cancelled - confirmation text did not match.');
      return;
    }

    setIsDangerLoading(true);
    try {
      // TODO: Implement account deletion API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast.success('Account deletion initiated. You will be logged out shortly.');
      // In real implementation, this would trigger logout and redirect
    } catch {
      toast.error('Error deleting account. Please contact support.');
    } finally {
      setIsDangerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-gray-600">Manage your account preferences and privacy settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose what notifications you&apos;d like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-analysis">Analysis Complete</Label>
                    <p className="text-sm text-gray-500">Get notified when your analysis is ready</p>
                  </div>
                  <Switch
                    id="email-analysis"
                    checked={notifications.emailAnalysisComplete}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailAnalysisComplete: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-credits">Low Credits Warning</Label>
                    <p className="text-sm text-gray-500">Alert when you have 5 or fewer credits</p>
                  </div>
                  <Switch
                    id="email-credits"
                    checked={notifications.emailCreditsLow}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailCreditsLow: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-weekly">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Summary of your analysis activity</p>
                  </div>
                  <Switch
                    id="email-weekly"
                    checked={notifications.emailWeeklyReport}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailWeeklyReport: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-marketing">Product Updates</Label>
                    <p className="text-sm text-gray-500">New features and product announcements</p>
                  </div>
                  <Switch
                    id="email-marketing"
                    checked={notifications.emailMarketingUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailMarketingUpdates: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>
                Control how your data is used and stored
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="data-retention">Data Retention</Label>
                  <select
                    id="data-retention"
                    value={privacy.dataRetention}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, dataRetention: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="3months">3 months</option>
                    <option value="6months">6 months</option>
                    <option value="12months">12 months</option>
                    <option value="24months">24 months</option>
                    <option value="forever">Keep forever</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">How long to keep your analysis history</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
                  </div>
                  <Switch
                    id="analytics"
                    checked={privacy.analyticsTracking}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, analyticsTracking: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="integrations">Third-party Integrations</Label>
                    <p className="text-sm text-gray-500">Allow external tools to access your data</p>
                  </div>
                  <Switch
                    id="integrations"
                    checked={privacy.thirdPartyIntegrations}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({ ...prev, thirdPartyIntegrations: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region
              </CardTitle>
              <CardDescription>
                Customize your experience based on your location and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Interface Language</Label>
                  <select
                    id="language"
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="analysis-language">Default Analysis Language</Label>
                  <select
                    id="analysis-language"
                    value={preferences.analysisLanguage}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analysisLanguage: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="America/Sao_Paulo">São Paulo</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <select
                    id="date-format"
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how TrueCheckIA looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-gray-500">Choose your preferred theme</p>
                </div>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isLoading} className="w-32">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Plan:</span>
                  <Badge variant="default">{user?.plan || 'Free'}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Credits:</span>
                  <span className="font-medium">{user?.credits || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Member since:</span>
                  <span className="text-sm">
                    {user?.createdAt ? new Date(user.createdAt as Date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Contact Support
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Documentation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Report a Bug
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium text-red-800 mb-1">Delete Account</h4>
                  <p className="text-sm text-red-600 mb-3">
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={isDangerLoading}
                    className="w-full"
                  >
                    {isDangerLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}