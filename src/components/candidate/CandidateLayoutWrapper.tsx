'use client';

import { usePathname } from 'next/navigation';
import { CandidateLayout } from './CandidateLayout';

interface CandidateLayoutWrapperProps {
  children: React.ReactNode;
}

export function CandidateLayoutWrapper({ children }: Readonly<CandidateLayoutWrapperProps>) {
  const pathname = usePathname();
  
  // Don't wrap auth pages with CandidateLayout
  const isAuthPage = pathname === '/candidate/login' || 
                    pathname === '/candidate/register' || 
                    pathname === '/candidate/complete-profile' ||
                    pathname === '/candidate/verify-email';
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return <CandidateLayout>{children}</CandidateLayout>;
}
