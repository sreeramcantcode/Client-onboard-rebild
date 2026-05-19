"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FullScreenLoader } from "@/components/primitives";
import { PORTAL_BASE } from "@/lib/constants";

export default function ClientPortalIndex() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user === undefined) return;
    if (!user) router.replace(`${PORTAL_BASE}/login`);
    else router.replace(user.role === "admin" ? `${PORTAL_BASE}/admin` : `${PORTAL_BASE}/client`);
  }, [user, router]);
  return <FullScreenLoader />;
}
