'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EmployerSidebarProps {
  expanded: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

export function EmployerSidebar({ expanded }: Readonly<EmployerSidebarProps>) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['dashboard']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isSectionActive = (section: string) => pathname.startsWith(section);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/employer/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      label: 'Jobs',
      href: '/employer/jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      ),
      children: [
        { label: 'All Jobs', href: '/employer/jobs', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'Post New Job', href: '/employer/jobs/create', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Job Templates', href: '/employer/jobs/templates', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Job Analytics', href: '/employer/jobs/analytics', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Applications',
      href: '/employer/applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      children: [
        { label: 'All Applications', href: '/employer/applications', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'Pending Review', href: '/employer/applications/pending', icon: <span className="w-2 h-2 bg-amber-400 rounded-full" /> },
        { label: 'Shortlisted', href: '/employer/applications/shortlisted', icon: <span className="w-2 h-2 bg-blue-400 rounded-full" /> },
        { label: 'Interviewed', href: '/employer/applications/interviewed', icon: <span className="w-2 h-2 bg-purple-400 rounded-full" /> },
        { label: 'Hired', href: '/employer/applications/hired', icon: <span className="w-2 h-2 bg-green-400 rounded-full" /> },
        { label: 'Rejected', href: '/employer/applications/rejected', icon: <span className="w-2 h-2 bg-red-400 rounded-full" /> }
      ]
    },
    {
      label: 'Candidates',
      href: '/employer/candidates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      children: [
        { label: 'Browse Candidates', href: '/employer/candidates', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'Saved Candidates', href: '/employer/candidates/saved', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Candidate Search', href: '/employer/candidates/search', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Talent Pool', href: '/employer/candidates/talent-pool', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Company',
      href: '/employer/company',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      children: [
        { label: 'Company Profile', href: '/employer/company', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'Team Members', href: '/employer/company/team', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Company Culture', href: '/employer/company/culture', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Branding', href: '/employer/company/branding', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Analytics',
      href: '/employer/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      children: [
        { label: 'Overview', href: '/employer/analytics', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'Job Performance', href: '/employer/analytics/jobs', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Application Metrics', href: '/employer/analytics/applications', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Hiring Reports', href: '/employer/analytics/reports', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Settings',
      href: '/employer/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      children: [
        { label: 'Account Settings', href: '/employer/settings', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'Notification Preferences', href: '/employer/settings/notifications', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Privacy & Security', href: '/employer/settings/privacy', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Billing & Subscription', href: '/employer/settings/billing', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    }
  ];

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.label.toLowerCase());
    const isCurrentActive = isActive(item.href) || isSectionActive(item.href);

    return (
      <div key={item.href}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleSection(item.label.toLowerCase())}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrentActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${level > 0 ? 'ml-4' : ''}`}
            >
              <span className="mr-3">{item.icon}</span>
              {expanded && <span className="flex-1 text-left">{item.label}</span>}
              {expanded && (
                <svg
                  className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          ) : (
            <Link
              href={item.href}
              className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isCurrentActive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${level > 0 ? 'ml-4' : ''}`}
            >
              <span className="mr-3">{item.icon}</span>
              {expanded && <span className="flex-1">{item.label}</span>}
              {item.badge && expanded && (
                <span className="ml-auto px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && expanded && isExpanded && (
          <div className="mt-1 ml-4 space-y-1">
            {item.children!.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        expanded ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          {expanded ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">JG</span>
              </div>
              <span className="text-lg font-bold text-gray-900">Job Genie</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">JG</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navItems.map(item => renderNavItem(item))}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-gray-200">
          {expanded ? (
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="text-xs text-emerald-700 font-medium mb-2">Need Help?</div>
              <Link
                href="/employer/support"
                className="text-xs text-emerald-600 hover:text-emerald-700 underline"
              >
                Contact Support
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link
                href="/employer/support"
                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                title="Support"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
