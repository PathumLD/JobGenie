'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth-storage';

interface EmployerHeaderProps {
  onSidebarToggle: () => void;
  isSidebarOpen: boolean;
}

export function EmployerHeader({ onSidebarToggle, isSidebarOpen }: Readonly<EmployerHeaderProps>) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    first_name?: string | null;
    last_name?: string | null;
    email?: string;
  } | null>(null);
  const [companyProfile, setCompanyProfile] = useState<{
    name?: string;
    email?: string;
    logo_url?: string;
  } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch user profile and company profile on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchCompanyProfile();
  }, []);

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

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.user);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const response = await fetch('/api/employer/company/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.company) {
            setCompanyProfile({
              name: data.company.name,
              email: data.company.email,
              logo_url: data.company.logo_url
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 Starting employer logout process...');
      setShowProfileDropdown(false);
      
      // Use the new localStorage-based logout function
      await logout();
      
      // Redirect to employer login page
      console.log('🔄 Redirecting to employer login...');
      router.push('/employer/login');
      
    } catch (error) {
      console.error('❌ Employer logout error:', error);
      // Even if logout fails, redirect to login
      router.push('/employer/login');
    }
  };

  const getInitials = () => {
    if (companyProfile?.name) {
      // Use company name initials
      const words = companyProfile.name.split(' ');
      if (words.length >= 2) {
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
      } else {
        return companyProfile.name.substring(0, 2).toUpperCase();
      }
    }
    // Fallback to employer name if company name not available
    if (userProfile) {
      const firstName = userProfile.first_name || '';
      const lastName = userProfile.last_name || '';
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'E';
    }
    return 'E';
  };

  const getDisplayName = () => {
    if (companyProfile?.name) {
      return companyProfile.name;
    }
    // Fallback to employer name if company name not available
    if (userProfile) {
      const firstName = userProfile.first_name || '';
      const lastName = userProfile.last_name || '';
      return `${firstName} ${lastName}`.trim() || 'Employer';
    }
    return 'Employer';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side - Logo and Sidebar Toggle */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JG</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Job Genie</span>
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

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 relative"
              aria-label="Notifications"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
              </svg>
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full"></span>
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <Card className="absolute right-0 mt-2 w-80 shadow-lg border-0 z-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-emerald-900">New Application</p>
                          <p className="text-xs text-emerald-700 mt-1">You have received a new job application</p>
                          <p className="text-xs text-emerald-600 mt-1">2 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">Profile Update</p>
                          <p className="text-xs text-blue-700 mt-1">Your company profile has been verified</p>
                          <p className="text-xs text-blue-600 mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Link
                      href="/employer/notifications"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-emerald-600">
                {companyProfile?.logo_url ? (
                  <img
                    src={companyProfile.logo_url}
                    alt={`${companyProfile.name} logo`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-white font-medium text-sm">${getInitials()}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-white font-medium text-sm">{getInitials()}</span>
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                <p className="text-xs text-gray-500">Employer</p>
              </div>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile dropdown menu */}
            {showProfileDropdown && (
              <Card className="absolute right-0 mt-2 w-56 shadow-lg bg-white border-0 z-50">
                <CardContent className="p-2">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500">{companyProfile?.email || userProfile?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/employer/profile"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </Link>
                    
                    <Link
                      href="/employer/company"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Company Settings
                    </Link>
                    
                    <Link
                      href="/employer/settings"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Account Settings
                    </Link>
                  </div>
                  
                  <div className="py-1 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign out
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
