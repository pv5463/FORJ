import AppShell from "@/components/layout/AppShell";

export default function IdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
