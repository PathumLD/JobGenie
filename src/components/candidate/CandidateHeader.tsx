'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CandidateHeaderProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

export function CandidateHeader({ onSidebarToggle, isSidebarOpen }: CandidateHeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // First, clear client-side storage immediately
      setShowProfileDropdown(false);
      localStorage.clear();
      sessionStorage.clear();
      
      // Get all cookies and clear them ALL
      const allCookies = document.cookie.split(';');
      const paths = ['/', '/candidate', '/api', '/auth'];
      const domains = ['', '.localhost', '.local'];
      
      // Clear ALL cookies with different variations
      allCookies.forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name) {
          paths.forEach(path => {
            domains.forEach(domain => {
              // Clear with different expiration formats
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
              document.cookie = `${name}=; max-age=0; path=${path}; domain=${domain}`;
              // Also try without domain specification
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
              document.cookie = `${name}=; max-age=0; path=${path}`;
            });
          });
        }
      });

      // Also clear common cookies that might not be in document.cookie (httpOnly)
      const commonCookies = [
        'access_token', 'refresh_token', 'token', 'session', 'auth',
        'next-auth.callback-url', 'next-auth.csrf-token', 'next-auth.session-token',
        'next-auth.pkce.code-verifier', 'next-auth.pkce.state',
        '_next_hmr_ref', 'next-auth.csrf-token', 'next-auth.callback-url'
      ];

      commonCookies.forEach(cookieName => {
        paths.forEach(path => {
          domains.forEach(domain => {
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
            document.cookie = `${cookieName}=; max-age=0; path=${path}; domain=${domain}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
            document.cookie = `${cookieName}=; max-age=0; path=${path}`;
          });
        });
      });

      // Try standard logout first
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Check if cookies are actually cleared
        const remainingCookies = document.cookie;
        const hasAuthCookies = remainingCookies.includes('access_token=') || 
                              remainingCookies.includes('refresh_token=') ||
                              remainingCookies.includes('token=') ||
                              remainingCookies.includes('session=');
        
        if (hasAuthCookies || remainingCookies.length > 0) {
          // Cookies still exist, try HTML format logout
          console.log('Cookies still present, trying HTML format logout...');
          const htmlResponse = await fetch('/api/auth/logout?format=html', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'text/html'
            }
          });
          
          if (htmlResponse.ok) {
            // HTML response will handle the redirect
            return;
          }
        }
        
        // Add a small delay to ensure cookies are cleared
        setTimeout(() => {
          // Force a page reload to ensure all auth state is cleared
          window.location.href = '/candidate/login';
        }, 100);
      } else {
        console.error('Logout failed:', response.statusText);
        // Try HTML format as fallback
        try {
          const htmlResponse = await fetch('/api/auth/logout?format=html', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'text/html'
            }
          });
          
          if (htmlResponse.ok) {
            // HTML response will handle the redirect
            return;
          }
        } catch (htmlError) {
          console.error('HTML logout also failed:', htmlError);
        }
        
        // Even if logout fails, redirect to login
        setTimeout(() => {
          window.location.href = '/candidate/login';
        }, 100);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Try HTML format as last resort
      try {
        const htmlResponse = await fetch('/api/auth/logout?format=html', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'text/html'
          }
        });
        
        if (htmlResponse.ok) {
          // HTML response will handle the redirect
          return;
        }
      } catch (htmlError) {
        console.error('HTML logout also failed:', htmlError);
      }
      
      // Even if there's an error, redirect to login
      setTimeout(() => {
        window.location.href = '/candidate/login';
      }, 100);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Logo and Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JG</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Job Genie</span>
          </div>
          
          {/* Sidebar Toggle Button */}
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Center - Navigation Links */}
        {/* <nav className="hidden md:flex items-center space-x-8">
          <Link href="/candidate/dashboard" className="text-gray-600 hover:text-emerald-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/candidate/jobs" className="text-gray-600 hover:text-emerald-600 transition-colors">
            Jobs
          </Link>
          <Link href="/candidate/applications" className="text-gray-600 hover:text-emerald-600 transition-colors">
            Applications
          </Link>
          <Link href="/candidate/profile" className="text-gray-600 hover:text-emerald-600 transition-colors">
            Profile
          </Link>
          <Link href="/candidate/saved-jobs" className="text-gray-600 hover:text-emerald-600 transition-colors">
            Saved Jobs
          </Link>
        </nav> */}

        {/* Right side - Actions and Profile */}
        <div className="flex items-center space-x-4">
          {/* Upload CV Button */}
          <Link href="/candidate/cv-extraction">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload CV
            </Button>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19a2.5 2.5 0 01-2.5-2.5V7a2.5 2.5 0 012.5-2.5h15a2.5 2.5 0 012.5 2.5v9.5a2.5 2.5 0 01-2.5 2.5h-15z" />
              </svg>
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <Card className="absolute right-0 mt-2 w-80 shadow-xl border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700">
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {/* Sample notifications */}
                    <div className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Your application for Software Engineer has been reviewed</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">New job matches your profile: Full Stack Developer</p>
                        <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Profile update reminder: Keep your skills current</p>
                        <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <Link href="/candidate/notifications" className="text-sm text-emerald-600 hover:text-emerald-700 text-center block">
                      View all notifications
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">JD</span>
              </div>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileDropdown && (
              <Card className="absolute right-0 mt-2 w-48 shadow-xl border-0">
                <CardContent className="p-2">
                  <div className="space-y-1">
                    <Link
                      href="/candidate/view-profile"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </Link>
                    
                    <Link
                      href="/candidate/settings"
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
