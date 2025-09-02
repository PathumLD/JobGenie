'use client';

import { usePathname } from 'next/navigation';
import { MisLayout } from './MisLayout';

interface MisLayoutWrapperProps {
  children: React.ReactNode;
}

export function MisLayoutWrapper({ children }: MisLayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't wrap auth pages with MisLayout
  const isAuthPage = pathname === '/mis/login' || 
                    pathname === '/mis/register' || 
                    pathname === '/mis/forgot-password';
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return <MisLayout>{children}</MisLayout>;
}
