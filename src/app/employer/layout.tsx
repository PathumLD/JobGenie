import { EmployerLayoutWrapper } from '@/components/employer/EmployerLayoutWrapper';

export default function EmployerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmployerLayoutWrapper>{children}</EmployerLayoutWrapper>;
}
