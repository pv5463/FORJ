import AppShell from "@/components/layout/AppShell";

export default function ApplicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
