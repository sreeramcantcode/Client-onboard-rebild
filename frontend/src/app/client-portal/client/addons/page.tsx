"use client";

import React, { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import {
  PageHeader,
  Loader,
  PrimaryButton,
  Pill,
  Modal,
  Textarea,
} from "@/components/primitives";
import * as Lucide from "lucide-react";
import { Plus, Send } from "lucide-react";

interface AddOn { id: string; name: string; description: string; price: number; icon: string }
interface AddOnRequest { id: string; addon_id: string; addon_name: string; addon_price: number; status: string; created_at: string }

function getIcon(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((Lucide as any)[name] || Lucide.Sparkles) as React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export default function ClientAddonsPage() {
  const [addons, setAddons] = useState<AddOn[] | null>(null);
  const [requests, setRequests] = useState<AddOnRequest[]>([]);
  const [selected, setSelected] = useState<AddOn | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const [a, r] = await Promise.all([
      api.get<AddOn[]>("/addons"),
      api.get<AddOnRequest[]>("/client/addons/requests"),
    ]);
    setAddons(a.data || []);
    setRequests(r.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  if (!addons) return <Loader />;

  const submit = async () => {
    if (!selected) return;
    setSending(true);
    setError("");
    try {
      await api.post("/client/addons/request", { addon_id: selected.id, note });
      setSelected(null);
      setNote("");
      load();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSending(false);
    }
  };

  const requestedIds = new Set(requests.map((r) => r.addon_id));

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Boost your plan"
        title="Add-ons & extras"
        subtitle="One-tap requests for additional services. Your account manager will confirm pricing & timeline."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map((a) => {
          const Icon = getIcon(a.icon);
          const requested = requestedIds.has(a.id);
          return (
            <div
              key={a.id}
              className="group relative border border-zinc-200 rounded-2xl p-6 hover:border-[#F77418] hover:shadow-lg transition-all"
              data-testid={`addon-card-${a.id}`}
            >
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#F77418] to-[#D85F0E] text-black flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <div className="font-display font-bold text-lg text-zinc-900">{a.name}</div>
              <div className="text-sm text-zinc-500 mt-1.5 min-h-[40px]">{a.description}</div>
              <div className="mt-5 flex items-center justify-between">
                <div className="font-display font-black text-2xl text-zinc-900">
                  ₹{a.price?.toFixed(0) || 0}
                  <span className="text-xs font-normal text-zinc-500"> / one-time</span>
                </div>
                {requested ? (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
                    Requested
                  </span>
                ) : (
                  <button
                    onClick={() => setSelected(a)}
                    data-testid={`request-addon-${a.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text- border-1 bg-zinc-500 rounded-md p-2 px-4 hover:text-orange-500 hover:bg-black transition"
                  >
                    Request <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {requests.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-bold text-xl text-zinc-900 mb-4">Your requests</h2>
          <div className="border border-zinc-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="text-left px-4 py-3">Add-on</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Requested</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3 font-medium text-zinc-900">{r.addon_name}</td>
                    <td className="px-4 py-3 font-mono text-zinc-700">₹{r.addon_price?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Pill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Request: ${selected?.name || ""}`}
      >
        <div className="space-y-4">
          <div className="text-sm text-zinc-600">
            Tell us anything specific about this request. Our team will reach out with details.
          </div>
          <Textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)…"
            data-testid="addon-note-input"
          />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <PrimaryButton onClick={submit} disabled={sending} data-testid="submit-addon-request">
            <Plus className="w-4 h-4" />
            {sending ? "Sending…" : "Send request"}
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
