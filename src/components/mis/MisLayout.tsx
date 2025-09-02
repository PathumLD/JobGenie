'use client';

import { useState, useEffect } from 'react';
import { MisHeader } from './MisHeader';
import { MisSidebar } from './MisSidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface MisLayoutProps {
  children: React.ReactNode;
}

export function MisLayout({ children }: MisLayoutProps) {
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
    <AuthGuard redirectTo="/mis/login" requiredRole={['mis']}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <MisSidebar expanded={sidebarExpanded} />
        
        {/* Header */}
        <MisHeader
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
