import { CandidateLayoutWrapper } from '@/components/candidate/CandidateLayoutWrapper';

export default function ResumeManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporarily bypass AuthGuard for testing
  return <CandidateLayoutWrapper>{children}</CandidateLayoutWrapper>;
}
