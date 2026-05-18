import React from "react";
import { PageHeader } from "@/components/Primitives";
import { useAuth } from "@/lib/AuthContext";
import RebildLogo from "@/components/RebildLogo";

export default function AdminSettings() {
    const { user } = useAuth();
    return (
        <div className="p-6 md:p-10 max-w-3xl">
            <PageHeader eyebrow="Workspace" title="Settings" subtitle="Manage your agency workspace." />
            <div className="space-y-6">
                <div className="border border-zinc-200 rounded-2xl p-6">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Brand</div>
                    <div className="flex items-center gap-4">
                        <div className="bg-black rounded-xl p-4"><RebildLogo size="lg" /></div>
                        <div>
                            <div className="font-display font-bold text-lg text-zinc-900">Rebild Marketing</div>
                            <div className="text-sm text-zinc-500">Full-service creative agency</div>
                        </div>
                    </div>
                </div>
                <div className="border border-zinc-200 rounded-2xl p-6">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Your account</div>
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <Field label="Name" value={user?.name} />
                        <Field label="Email" value={user?.email} />
                        <Field label="Role" value={user?.role} />
                        <Field label="Member since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({ label, value }) {
    return (
        <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1.5">{label}</div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2.5 text-sm text-zinc-900">{value}</div>
        </div>
    );
}
