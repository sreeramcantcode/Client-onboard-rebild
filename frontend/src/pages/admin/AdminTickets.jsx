import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState, PrimaryButton, Pill, Input, Select } from "@/components/Primitives";
import { Ticket, Send } from "lucide-react";

export default function AdminTickets() {
    const [tickets, setTickets] = useState(null);
    const [open, setOpen] = useState(null);
    const [reply, setReply] = useState("");

    const load = async () => {
        const r = await api.get("/admin/tickets");
        setTickets(r.data || []);
        if (open) {
            const fresh = (r.data || []).find((t) => t.id === open.id);
            if (fresh) setOpen(fresh);
        }
    };
    useEffect(() => { load(); }, []);
    if (!tickets) return <Loader />;

    const send = async () => {
        if (!reply.trim()) return;
        await api.post(`/admin/tickets/${open.id}/messages`, { message: reply });
        setReply(""); load();
    };
    const setStatus = async (status) => {
        await api.patch(`/admin/tickets/${open.id}/status`, { status }); load();
    };

    return (
        <div className="p-6 md:p-10">
            <PageHeader eyebrow="Support" title="Tickets" subtitle="Reply to client questions, mark resolved, keep the love flowing." />
            {tickets.length === 0 ? (
                <EmptyState icon={Ticket} title="No tickets" description="When clients open a ticket, it'll appear here." />
            ) : (
                <div className="grid lg:grid-cols-[380px,1fr] gap-6">
                    <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                        {tickets.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setOpen(t)}
                                data-testid={`admin-ticket-${t.id}`}
                                className={`w-full text-left border rounded-xl p-4 transition ${open?.id === t.id ? "border-[#F77418] bg-orange-50/40" : "border-zinc-200 hover:border-zinc-300"}`}
                            >
                                <div className="flex items-center gap-2 mb-1.5"><Pill status={t.status} /><Pill status={t.priority} /></div>
                                <div className="font-semibold text-zinc-900 text-sm">{t.subject}</div>
                                <div className="text-xs text-zinc-500 mt-1">{t.client_name} · {new Date(t.updated_at).toLocaleString()}</div>
                            </button>
                        ))}
                    </div>
                    <div className="border border-zinc-200 rounded-2xl p-6 min-h-[400px] flex flex-col">
                        {!open ? (
                            <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">Select a ticket to reply.</div>
                        ) : (
                            <>
                                <div className="border-b border-zinc-100 pb-4 mb-4 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2"><Pill status={open.status} /><Pill status={open.priority} /></div>
                                        <div className="font-display font-bold text-xl text-zinc-900 mt-2">{open.subject}</div>
                                        <div className="text-xs text-zinc-500">{open.client_name}</div>
                                    </div>
                                    <Select value={open.status} onChange={(e) => setStatus(e.target.value)} className="w-36">
                                        <option value="open">Open</option>
                                        <option value="pending">Pending</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </Select>
                                </div>
                                <div className="flex-1 space-y-4 max-h-[480px] overflow-y-auto pr-2">
                                    {(open.messages || []).map((m) => {
                                        const mine = m.author_role === "admin";
                                        return (
                                            <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${mine ? "bg-[#F77418] text-black" : "bg-zinc-100 text-zinc-900"}`}>
                                                    <div className={`text-[10px] uppercase tracking-wider mb-1 ${mine ? "text-black/60" : "text-zinc-500"}`}>
                                                        {m.author_name} · {m.author_role}
                                                    </div>
                                                    <div className="whitespace-pre-line">{m.message}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" onKeyDown={(e) => e.key === "Enter" && send()} data-testid="admin-ticket-reply" />
                                    <PrimaryButton onClick={send} data-testid="admin-ticket-send"><Send className="w-4 h-4" /></PrimaryButton>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
