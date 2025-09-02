'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MisSidebarProps {
  expanded: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

export function MisSidebar({ expanded }: Readonly<MisSidebarProps>) {
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
      href: '/mis/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      label: 'Job Management',
      href: '/mis/jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
        </svg>
      ),
      children: [
        { label: 'All Jobs', href: '/mis/jobs', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Create Job', href: '/mis/jobs/create', icon: <span className="w-2 h-2 bg-emerald-400 rounded-full" /> },
        { label: 'Job Applications', href: '/mis/applications', icon: <span className="w-2 h-2 bg-blue-400 rounded-full" /> },
        { label: 'Job Analytics', href: '/mis/jobs/analytics', icon: <span className="w-2 h-2 bg-purple-400 rounded-full" /> }
      ]
    },
    {
      label: 'Candidate Management',
      href: '/mis/candidates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      children: [
        { label: 'All Candidates', href: '/mis/candidates', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Candidate Approval', href: '/mis/candidate-approval', icon: <span className="w-2 h-2 bg-yellow-400 rounded-full" /> },
        { label: 'Candidate Profiles', href: '/mis/candidate-profiles', icon: <span className="w-2 h-2 bg-blue-400 rounded-full" /> },
        { label: 'Talent Pool', href: '/mis/talent-pool', icon: <span className="w-2 h-2 bg-green-400 rounded-full" /> }
      ]
    },
    {
      label: 'Company Management',
      href: '/mis/companies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      children: [
        { label: 'All Companies', href: '/mis/companies', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Company Verification', href: '/mis/company-verification', icon: <span className="w-2 h-2 bg-yellow-400 rounded-full" /> },
        { label: 'Company Access', href: '/mis/company-access', icon: <span className="w-2 h-2 bg-blue-400 rounded-full" /> }
      ]
    },
    {
      label: 'Reports & Analytics',
      href: '/mis/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      children: [
        { label: 'Job Reports', href: '/mis/reports/jobs', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Candidate Reports', href: '/mis/reports/candidates', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Application Analytics', href: '/mis/reports/applications', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'System Metrics', href: '/mis/reports/system', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'User Management',
      href: '/mis/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      children: [
        { label: 'MIS Users', href: '/mis/users/mis', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Employer Users', href: '/mis/users/employers', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Candidate Users', href: '/mis/users/candidates', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'User Permissions', href: '/mis/users/permissions', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
      ]
    },
    {
      label: 'Settings',
      href: '/mis/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      children: [
        { label: 'System Settings', href: '/mis/settings/system', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Job Settings', href: '/mis/settings/jobs', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'Email Templates', href: '/mis/settings/email-templates', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> },
        { label: 'API Configuration', href: '/mis/settings/api', icon: <span className="w-2 h-2 bg-gray-400 rounded-full" /> }
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
      className={`fixed left-0 top-0 z-20 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
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
                href="/mis/support"
                className="text-xs text-emerald-600 hover:text-emerald-700 underline"
              >
                Contact Support
              </Link>
            </div>
          ) : (
            <div className="flex justify-center">
              <Link
                href="/mis/support"
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
