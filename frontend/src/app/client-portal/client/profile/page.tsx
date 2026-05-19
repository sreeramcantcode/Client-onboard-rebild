"use client";

import React from "react";
import { PageHeader } from "@/components/primitives";
import { useAuth } from "@/lib/auth-context";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1.5">{label}</div>
      <div className="bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900">
        {value || "—"}
      </div>
    </div>
  );
}

export default function ClientProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const initials = (user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        subtitle="Your account details. To change anything, contact your Rebild manager."
      />
      <div className="border border-zinc-200 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#F77418] to-[#D85F0E] text-black flex items-center justify-center font-display font-black text-2xl">
            {initials}
          </div>
          <div>
            <div className="font-display font-bold text-xl text-zinc-900">{user.name}</div>
            <div className="text-sm text-zinc-500">{user.email}</div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Name" value={user.name} />
          <Field label="Email" value={user.email} />
          <Field label="Company" value={user.company} />
          <Field label="Phone" value={user.phone} />
          <Field
            label="Account created"
            value={user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
          />
          <Field label="Role" value={user.role} />
        </div>
      </div>
    </div>
  );
}
