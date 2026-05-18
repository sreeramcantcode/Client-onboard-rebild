import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState, PrimaryButton, Pill, Modal, Input, Textarea } from "@/components/Primitives";
import { Plus, Trash2 } from "lucide-react";

export default function AdminAddons() {
    const [addons, setAddons] = useState(null);
    const [requests, setRequests] = useState([]);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", price: 0, icon: "Sparkles" });

    const load = async () => {
        const [a, r] = await Promise.all([api.get("/addons"), api.get("/admin/addons/requests")]);
        setAddons(a.data || []); setRequests(r.data || []);
    };
    useEffect(() => { load(); }, []);
    if (!addons) return <Loader />;

    const submit = async () => {
        await api.post("/admin/addons", { ...form, price: Number(form.price) });
        setCreating(false); setForm({ name: "", description: "", price: 0, icon: "Sparkles" }); load();
    };
    const remove = async (id) => {
        if (!window.confirm("Delete add-on?")) return;
        await api.delete(`/admin/addons/${id}`); load();
    };
    const updateRequest = async (id, status) => {
        await api.patch(`/admin/addons/requests/${id}`, { status }); load();
    };

    return (
        <div className="p-6 md:p-10">
            <PageHeader
                eyebrow="Upsells"
                title="Add-ons"
                subtitle="Optional services clients can request directly from their portal."
                action={<PrimaryButton onClick={() => setCreating(true)} data-testid="new-addon-button"><Plus className="w-4 h-4" /> New add-on</PrimaryButton>}
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
                {addons.length === 0 ? (
                    <div className="col-span-full"><EmptyState icon={Plus} title="No add-ons yet" /></div>
                ) : addons.map((a) => (
                    <div key={a.id} className="border border-zinc-200 rounded-xl p-4 group">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <div className="font-semibold text-zinc-900">{a.name}</div>
                                <div className="text-xs text-zinc-500 line-clamp-2 mt-1">{a.description}</div>
                                <div className="font-display font-bold text-xl text-zinc-900 mt-3">${a.price?.toFixed(2)}</div>
                            </div>
                            <button onClick={() => remove(a.id)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="font-display font-bold text-xl text-zinc-900 mb-4">Client requests</h2>
            {requests.length === 0 ? (
                <div className="text-sm text-zinc-500 border border-dashed border-zinc-200 rounded-xl p-6 text-center">No add-on requests yet.</div>
            ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                            <tr><th className="text-left px-4 py-3">Client</th><th className="text-left px-4 py-3">Add-on</th><th className="text-left px-4 py-3">Price</th><th className="text-left px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
                        </thead>
                        <tbody>
                            {requests.map((r) => (
                                <tr key={r.id} className="border-t border-zinc-100">
                                    <td className="px-4 py-3 font-medium text-zinc-900">{r.client_name}</td>
                                    <td className="px-4 py-3 text-zinc-700">{r.addon_name}</td>
                                    <td className="px-4 py-3 font-mono">${r.addon_price?.toFixed(2)}</td>
                                    <td className="px-4 py-3"><Pill status={r.status} /></td>
                                    <td className="px-4 py-3 text-right">
                                        {r.status === "pending" && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => updateRequest(r.id, "resolved")} className="text-xs font-semibold text-emerald-700 hover:underline">Approve</button>
                                                <button onClick={() => updateRequest(r.id, "closed")} className="text-xs font-semibold text-zinc-500 hover:underline">Dismiss</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={creating} onClose={() => setCreating(false)} title="New add-on">
                <div className="space-y-4">
                    <div><div className="text-xs font-semibold text-zinc-700 mb-1.5">Name</div><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="addon-name" /></div>
                    <div><div className="text-xs font-semibold text-zinc-700 mb-1.5">Description</div><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div><div className="text-xs font-semibold text-zinc-700 mb-1.5">Price</div><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} data-testid="addon-price" /></div>
                    <div><div className="text-xs font-semibold text-zinc-700 mb-1.5">Lucide icon</div><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></div>
                    <PrimaryButton onClick={submit} disabled={!form.name} data-testid="create-addon-submit"><Plus className="w-4 h-4" /> Create</PrimaryButton>
                </div>
            </Modal>
        </div>
    );
}
