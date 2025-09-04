'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CandidateSidebarProps {
  expanded: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

export function CandidateSidebar({ expanded }: Readonly<CandidateSidebarProps>) {
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
      label: 'Jobs',
      href: '/candidate/jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      ),
      children: [
        { label: 'Browse Jobs', href: '/candidate/jobs', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Saved Jobs', href: '/candidate/saved-jobs', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Job Alerts', href: '/candidate/job-alerts', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Applications',
      href: '/candidate/applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      children: [
        { label: 'My Applications', href: '/candidate/applications', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Application Status', href: '/candidate/application-status', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Interview Schedule', href: '/candidate/interviews', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Dashboard',
      href: '/candidate/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      label: 'Profile',
      href: '/candidate/view-profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      children: [
        { label: 'Personal Info', href: '/candidate/view-profile', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Skills & Experience', href: '/candidate/skills', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Resume & Documents', href: '/candidate/resume-management', icon: <span className="w-2 h-2 bg-purple-400 rounded-full" /> },
        { label: 'Preferences', href: '/candidate/preferences', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Career Tools',
      href: '/candidate/career-tools',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      children: [
        { label: 'Resume Builder', href: '/candidate/resume-builder', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Upload CV', href: '/candidate/upload-cv', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'CV Extraction', href: '/candidate/cv-extraction', icon: <span className="w-2 h-2 bg-blue-400 rounded-full" /> },
        { label: 'Cover Letter', href: '/candidate/cover-letter', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Interview Prep', href: '/candidate/interview-prep', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Career Assessment', href: '/candidate/career-assessment', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Network',
      href: '/candidate/network',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      children: [
        { label: 'Connections', href: '/candidate/connections', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Mentors', href: '/candidate/mentors', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Groups', href: '/candidate/groups', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Settings',
      href: '/candidate/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      children: [
        { label: 'Account Settings', href: '/candidate/settings', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Privacy', href: '/candidate/privacy', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Notifications', href: '/candidate/notifications', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
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
                href="/candidate/support"
                className="text-xs text-emerald-600 hover:text-emerald-700 underline"
              >
                Contact Support
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link
                href="/candidate/support"
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
