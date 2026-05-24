"use client";

import React from "react";
import { PageHeader } from "@/components/primitives";
import { useAuth } from "@/lib/auth-context";
import { Pencil, Check } from "lucide-react";
import api from "@/lib/api";

function Field({
  label,
  value,
  editable = false,
  onSave,
}: {
  label: string;
  value?: string | null;
  editable?: boolean;
  onSave?: (value: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [input, setInput] = React.useState(value || "");

  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1.5">
        {label}
      </div>

      <div className="bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900 flex items-center justify-between gap-2">
        
        {editing ? (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent outline-none flex-1"
          />
        ) : (
          <span>{value || "—"}</span>
        )}

        {editable && (
          editing ? (
            <button
              onClick={() => {
                onSave?.(input);
                setEditing(false);
              }}
              className="text-green-500"
            >
              <Check className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-zinc-500 hover:text-[#F77418]"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function ClientProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  const [profile, setProfile] = React.useState({
  name: user.name || "",
  company: user.company || "",
});

  const initials = (user.name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

    const updateProfile = async (field: string, value: string) => {
  try {
    await api.patch(`/client/profile`, {
      [field]: value,
    });

    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  } catch (err) {
    console.error(err);
  }
};

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
           <Field label="Name" value={profile.name} editable onSave={(val) => updateProfile("name", val)}/>
            <Field label="Email" value={user.email} />
          <Field label="Company" value={profile.company} editable onSave={(val) => updateProfile("company", val)}/>
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
