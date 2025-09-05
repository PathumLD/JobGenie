'use client';

import { usePathname } from 'next/navigation';
import { EmployerLayout } from './EmployerLayout';

interface EmployerLayoutWrapperProps {
  children: React.ReactNode;
}

export function EmployerLayoutWrapper({ children }: Readonly<EmployerLayoutWrapperProps>) {
  const pathname = usePathname();
  
  // Don't wrap auth pages with EmployerLayout
  const isAuthPage = pathname === '/employer/login' || 
                    pathname === '/employer/register' || 
                    pathname === '/employer/forgot-password' ||
                    pathname === '/employer/verify-email';
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return <EmployerLayout>{children}</EmployerLayout>;
}
