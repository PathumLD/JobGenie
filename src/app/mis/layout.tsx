import { MisLayoutWrapper } from '@/components/mis/MisLayoutWrapper';

export default function MisSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MisLayoutWrapper>{children}</MisLayoutWrapper>;
}
