import { CandidateLayout } from '@/components/candidate/CandidateLayout';
import { CandidateLayoutWrapper } from '@/components/candidate/CandidateLayoutWrapper';

export default function CandidateSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidateLayoutWrapper>{children}</CandidateLayoutWrapper>;
}
