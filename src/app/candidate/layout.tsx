
import { CandidateLayoutWrapper } from '@/components/candidate/CandidateLayoutWrapper';

export default function CandidateSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CandidateLayoutWrapper>{children}</CandidateLayoutWrapper>;
}
