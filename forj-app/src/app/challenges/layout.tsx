import AppShell from "@/components/layout/AppShell";

export default function ChallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
