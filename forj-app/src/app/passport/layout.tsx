import AppShell from "@/components/layout/AppShell";

export default function PassportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
