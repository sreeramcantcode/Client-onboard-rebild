import RoleGate from "@/components/role-gate";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <RoleGate role="client">{children}</RoleGate>;
}
