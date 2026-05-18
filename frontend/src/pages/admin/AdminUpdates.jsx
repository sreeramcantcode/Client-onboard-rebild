import React, { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { PageHeader, Loader, EmptyState, PrimaryButton, Pill, Modal, Input, Select, Textarea } from "@/components/Primitives";
import { Megaphone, Plus, Trash2 } from "lucide-react";

export default function AdminUpdates() {
    const [updates, setUpdates] = useState(null);
    const [clients, setClients] = useState([]);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ title: "", body: "", client_id: "", category: "Update" });
    const [error, setError] = useState("");

    const load = async () => {
        const [u, c] = await Promise.all([api.get("/admin/updates"), api.get("/admin/clients")]);
        setUpdates(u.data || []); setClients(c.data || []);
    };
    useEffect(() => { load(); }, []);
    if (!updates) return <Loader />;

    const submit = async () => {
        setError("");
        try {
            await api.post("/admin/updates", { ...form, client_id: form.client_id || null });
            setCreating(false); setForm({ title: "", body: "", client_id: "", category: "Update" }); load();
        } catch (e) { setError(formatApiError(e)); }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this update?")) return;
        await api.delete(`/admin/updates/${id}`); load();
    };

    return (
        <div className="p-6 md:p-10">
            <PageHeader
                eyebrow="Communication"
                title="Updates & reports"
                subtitle="Broadcast announcements, share progress, drop performance reports."
                action={<PrimaryButton onClick={() => setCreating(true)} data-testid="new-update-button"><Plus className="w-4 h-4" /> Post update</PrimaryButton>}
            />
            {updates.length === 0 ? (
                <EmptyState icon={Megaphone} title="No updates yet" description="Post your first update or report to your clients." />
            ) : (
                <div className="space-y-3">
                    {updates.map((u) => {
                        const target = u.client_id ? (clients.find((c) => c.id === u.client_id)?.name || "Client") : "All clients";
                        return (
                            <div key={u.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Pill status={u.category} />
                                            <span className="text-xs text-zinc-500 font-mono">→ {target}</span>
                                            <span className="text-xs text-zinc-400">· {new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="font-display font-bold text-lg text-zinc-900 mt-1.5">{u.title}</div>
                                        <div className="text-sm text-zinc-600 mt-1 whitespace-pre-line">{u.body}</div>
                                    </div>
                                    <button onClick={() => remove(u.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600 shrink-0"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal open={creating} onClose={() => setCreating(false)} title="Post update / report" size="lg">
                <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Recipient</div>
                            <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} data-testid="update-target">
                                <option value="">📣 All clients (broadcast)</option>
                                {clients.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                            </Select>
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Category</div>
                            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                <option>Update</option>
                                <option>Report</option>
                                <option>Announcement</option>
                            </Select>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-zinc-700 mb-1.5">Title</div>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="update-title" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-zinc-700 mb-1.5">Message</div>
                        <Textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} data-testid="update-body" />
                    </div>
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    <PrimaryButton onClick={submit} disabled={!form.title || !form.body} data-testid="post-update-submit">
                        <Plus className="w-4 h-4" /> Post
                    </PrimaryButton>
                </div>
            </Modal>
        </div>
    );
}
