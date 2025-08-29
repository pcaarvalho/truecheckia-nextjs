'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

export default function TestThemePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [testResults, setTestResults] = useState<{
    defaultLight: boolean | null;
    persistence: boolean | null;
    toggleToDark: boolean | null;
    toggleToLight: boolean | null;
  }>({
    defaultLight: null,
    persistence: null,
    toggleToDark: null,
    toggleToLight: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Test 1: Check if default is light
      const storedTheme = localStorage.getItem('truecheckia-theme');
      if (!storedTheme || storedTheme === 'light') {
        setTestResults(prev => ({ ...prev, defaultLight: true }));
      } else {
        setTestResults(prev => ({ ...prev, defaultLight: false }));
      }
    }
  }, [mounted]);

  const testPersistence = () => {
    const stored = localStorage.getItem('truecheckia-theme');
    setTestResults(prev => ({ 
      ...prev, 
      persistence: stored === theme 
    }));
  };

  const testToggleToDark = async () => {
    setTheme('dark');
    setTimeout(() => {
      const isDark = document.documentElement.classList.contains('dark');
      const stored = localStorage.getItem('truecheckia-theme');
      setTestResults(prev => ({ 
        ...prev, 
        toggleToDark: isDark && stored === 'dark' 
      }));
    }, 500);
  };

  const testToggleToLight = async () => {
    setTheme('light');
    setTimeout(() => {
      const isLight = !document.documentElement.classList.contains('dark');
      const stored = localStorage.getItem('truecheckia-theme');
      setTestResults(prev => ({ 
        ...prev, 
        toggleToLight: isLight && stored === 'light' 
      }));
    }, 500);
  };

  const clearAndReload = () => {
    localStorage.removeItem('truecheckia-theme');
    window.location.reload();
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Theme System Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Theme Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Current Theme:</strong> {theme}</p>
              <p><strong>Resolved Theme:</strong> {resolvedTheme}</p>
              <p><strong>HTML Class:</strong> {mounted && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}</p>
              <p><strong>LocalStorage:</strong> {mounted && localStorage.getItem('truecheckia-theme') || 'none'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>1. Default theme is light</span>
                {testResults.defaultLight === null ? (
                  <span className="text-gray-500">Not tested</span>
                ) : testResults.defaultLight ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>2. Theme persists in localStorage</span>
                {testResults.persistence === null ? (
                  <Button onClick={testPersistence} size="sm">Test</Button>
                ) : testResults.persistence ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>3. Can toggle to dark theme</span>
                {testResults.toggleToDark === null ? (
                  <Button onClick={testToggleToDark} size="sm">Test</Button>
                ) : testResults.toggleToDark ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>4. Can toggle to light theme</span>
                {testResults.toggleToLight === null ? (
                  <Button onClick={testToggleToLight} size="sm">Test</Button>
                ) : testResults.toggleToLight ? (
                  <Check className="text-green-500" />
                ) : (
                  <X className="text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => setTheme('light')}>Set Light</Button>
              <Button onClick={() => setTheme('dark')}>Set Dark</Button>
              <Button onClick={clearAndReload} variant="destructive">
                Clear Storage & Reload
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Toggle Component Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Test the actual theme toggle component in the header:</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="text-sm mb-2">This box should change color when theme changes:</p>
              <p>Light: Gray background</p>
              <p>Dark: Dark gray background</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
