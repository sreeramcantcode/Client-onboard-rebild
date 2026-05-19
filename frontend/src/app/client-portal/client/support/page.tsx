"use client";

import React, { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import {
  PageHeader,
  Loader,
  EmptyState,
  Pill,
  PrimaryButton,
  Modal,
  Input,
  Textarea,
  Select,
} from "@/components/primitives";
import { LifeBuoy, Send, Plus } from "lucide-react";

interface TicketMessage {
  id: string;
  author_id: string;
  author_name: string;
  author_role: "admin" | "client";
  message: string;
  created_at: string;
}
interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  messages: TicketMessage[];
  updated_at: string;
  created_at: string;
}

export default function ClientSupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [open, setOpen] = useState<Ticket | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{ subject: string; message: string; priority: "low" | "normal" | "high" }>({
    subject: "",
    message: "",
    priority: "normal",
  });
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const r = await api.get<Ticket[]>("/client/tickets");
    setTickets(r.data || []);
    if (open) {
      const fresh = (r.data || []).find((t) => t.id === open.id);
      if (fresh) setOpen(fresh);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!tickets) return <Loader />;

  const createTicket = async () => {
    setError("");
    try {
      await api.post("/client/tickets", form);
      setCreating(false);
      setForm({ subject: "", message: "", priority: "normal" });
      load();
    } catch (e) {
      setError(formatApiError(e));
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !open) return;
    await api.post(`/client/tickets/${open.id}/messages`, { message: reply });
    setReply("");
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Customer care"
        title="Support"
        subtitle="Reach our team directly. We aim to respond in under 2 hours during business hours."
        action={
          <PrimaryButton onClick={() => setCreating(true)} data-testid="new-ticket-button">
            <Plus className="w-4 h-4" /> New ticket
          </PrimaryButton>
        }
      />

      {tickets.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="No tickets yet"
          description="Open a ticket and the Rebild team will get back to you shortly."
          action={
            <PrimaryButton onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" /> Open a ticket
            </PrimaryButton>
          }
        />
      ) : (
        <div className="grid lg:grid-cols-[380px,1fr] gap-6">
          <div className="space-y-2">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setOpen(t)}
                data-testid={`ticket-${t.id}`}
                className={`w-full text-left border rounded-xl p-4 transition hover:border-zinc-300 ${
                  open?.id === t.id ? "border-[#F77418] bg-orange-50/40" : "border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Pill status={t.status} />
                  <Pill status={t.priority} />
                </div>
                <div className="font-semibold text-zinc-900 text-sm">{t.subject}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  {new Date(t.updated_at).toLocaleString()} · {t.messages?.length || 0} messages
                </div>
              </button>
            ))}
          </div>
          <div className="border border-zinc-200 rounded-2xl p-6 min-h-[400px] flex flex-col">
            {!open ? (
              <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm">
                Select a ticket to view the conversation.
              </div>
            ) : (
              <>
                <div className="border-b border-zinc-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Pill status={open.status} />
                    <Pill status={open.priority} />
                  </div>
                  <div className="font-display font-bold text-xl text-zinc-900 mt-2">{open.subject}</div>
                </div>
                <div className="flex-1 space-y-4 max-h-[480px] overflow-y-auto pr-2">
                  {(open.messages || []).map((m) => {
                    const mine = m.author_role === "client";
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                            mine ? "bg-[#0a0a0a] text-white" : "bg-zinc-100 text-zinc-900"
                          }`}
                        >
                          <div
                            className={`text-[10px] uppercase tracking-wider mb-1 ${
                              mine ? "text-zinc-400" : "text-zinc-500"
                            }`}
                          >
                            {m.author_name} · {m.author_role}
                          </div>
                          <div className="whitespace-pre-line">{m.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex gap-2">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply…"
                    onKeyDown={(e) => e.key === "Enter" && sendReply()}
                    data-testid="ticket-reply-input"
                  />
                  <PrimaryButton onClick={sendReply} data-testid="ticket-reply-send">
                    <Send className="w-4 h-4" />
                  </PrimaryButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Open a new ticket">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Subject</label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="What's it about?"
              data-testid="ticket-subject"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Priority</label>
            <Select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as "low" | "normal" | "high" })}
              data-testid="ticket-priority"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 mb-1.5 block">Message</label>
            <Textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us what's happening…"
              data-testid="ticket-message"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <PrimaryButton
            onClick={createTicket}
            disabled={!form.subject || !form.message}
            data-testid="create-ticket-submit"
          >
            <Send className="w-4 h-4" /> Send ticket
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
