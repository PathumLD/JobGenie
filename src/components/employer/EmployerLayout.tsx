'use client';

import { useState, useEffect } from 'react';
import { EmployerHeader } from './EmployerHeader';
import { EmployerSidebar } from './EmployerSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface EmployerLayoutProps {
  children: React.ReactNode;
}

export function EmployerLayout({ children }: EmployerLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <AuthGuard redirectTo="/employer/login" requiredRole={['employer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <EmployerSidebar expanded={sidebarExpanded} />
        
        {/* Header */}
        <EmployerHeader
          isSidebarOpen={sidebarExpanded}
          onSidebarToggle={toggleSidebar}
        />
        
        {/* Main Content */}
        <main
          className={`transition-all duration-300 relative ${
            sidebarExpanded ? 'ml-64' : 'ml-16'
          } pt-16`}
        >
          <div className="p-6">
            {children}
          </div>
        </main>

        {/* Mobile Overlay */}
        {isMobile && sidebarExpanded && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarExpanded(false)}
          />
        )}
      </div>
    </AuthGuard>
  );
}
