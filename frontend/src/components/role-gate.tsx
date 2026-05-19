"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type Role } from "@/lib/auth-context";
import { FullScreenLoader } from "@/components/primitives";
import { PORTAL_BASE } from "@/lib/constants";
import AppShell from "@/components/app-shell";

export default function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace(`${PORTAL_BASE}/login`);
    } else if (user.role !== role) {
      router.replace(user.role === "admin" ? `${PORTAL_BASE}/admin` : `${PORTAL_BASE}/client`);
    }
  }, [user, role, router]);

  if (user === undefined || !user || user.role !== role) return <FullScreenLoader />;

  return <AppShell kind={role}>{children}</AppShell>;
}
