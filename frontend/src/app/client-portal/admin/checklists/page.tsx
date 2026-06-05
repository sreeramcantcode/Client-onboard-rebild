"use client";

import React, { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import {
  PageHeader, Loader, EmptyState, PrimaryButton,
  Pill, Modal, Input,
} from "@/components/primitives";
import { CheckSquare, Plus, Trash2, X } from "lucide-react";

interface ChecklistItem { id: string; text: string; checked: boolean ;checked_by?: string | null  }
interface Checklist {
  id: string; title: string; client_id: string | null;
  items: ChecklistItem[]; created_at: string;
}
interface Client { id: string; name: string }

export default function AdminChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", client_id: "" });
  const [itemTexts, setItemTexts] = useState<string[]>([""]);
  const [error, setError] = useState("");

  const load = async () => {
    const [cl, c] = await Promise.all([
      api.get<Checklist[]>("/admin/checklists"),
      api.get<Client[]>("/admin/clients"),
    ]);
    setChecklists(cl.data || []);
    setClients(c.data || []);
  };

  useEffect(() => { load(); }, []);
  if (!checklists) return <Loader />;

  const addItemRow = () => setItemTexts((p) => [...p, ""]);
  const removeItemRow = (i: number) => setItemTexts((p) => p.filter((_, idx) => idx !== i));
  const updateItemRow = (i: number, val: string) =>
    setItemTexts((p) => p.map((v, idx) => (idx === i ? val : v)));

  const submit = async () => {
    setError("");
    const validItems = itemTexts.filter((t) => t.trim());
    if (!validItems.length) { setError("Add at least one item"); return; }
    try {
      await api.post("/admin/checklists", {
        title: form.title,
        client_id: form.client_id || null,
        items: validItems.map((text) => ({ text })),
      });
      setCreating(false);
      setForm({ title: "", client_id: "" });
      setItemTexts([""]);
      load();
    } catch (e) { setError(formatApiError(e)); }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this checklist?")) return;
    await api.delete(`/admin/checklists/${id}`);
    load();
  };

  const toggle = async (checklistId: string, itemId: string, checked: boolean) => {
    await api.patch(`/checklists/${checklistId}/items/${itemId}`, { checked });
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Tasks"
        title="Checklists"
        subtitle="Create task lists for clients to track progress."
        action={
          <PrimaryButton onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> New checklist
          </PrimaryButton>
        }
      />

      {checklists.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No checklists yet" description="Create your first checklist." />
      ) : (
        <div className="space-y-4">
          {checklists.map((cl) => {
            const target = cl.client_id
              ? clients.find((c) => c.id === cl.client_id)?.name || "Client"
              : "All clients";
            const done = cl.items.filter((i) => i.checked).length;
            return (
              <div key={cl.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs text-zinc-500 font-mono">→ {target}</span>
                      <span className="text-xs text-zinc-400">· {new Date(cl.created_at).toLocaleDateString()}</span>
                      <span className="text-xs font-medium text-[#F77418]">{done}/{cl.items.length} done</span>
                    </div>
                    <div className="font-display font-bold text-lg text-zinc-900 mb-3">{cl.title}</div>
                    <div className="space-y-2">
                      {cl.items.map((item) => (
                        <div key={item.id} className={`flex items-center gap-3 group ${!item.checked ? "cursor-pointer" : "cursor-default"}`}
                        onClick={() => !item.checked && toggle(cl.id, item.id, true)}
>
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                            item.checked
                              ? "bg-[#F77418] border-[#F77418]"
                              : "border-zinc-300 group-hover:border-[#F77418]"
                          }`}>
                            {item.checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-1">
  <span className={`text-sm transition-colors ${
    item.checked ? "line-through text-zinc-400" : "text-zinc-700 group-hover:text-zinc-900"
  }`}>
    {item.text}
  </span>
  {item.checked && item.checked_by && (
    <span className="text-xs text-zinc-400 shrink-0">
      ✓ {item.checked_by}
    </span>
  )}
</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => remove(cl.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New checklist" size="lg">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-700 mb-1.5">Title</div>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-700 mb-1.5">Recipient</div>
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77418]"
              >
                <option value="" className="text-black">All clients</option>
                {clients.map((c) => <option  className="text-black" key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Items</div>
            <div className="space-y-2">
              {itemTexts.map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={text}
                    onChange={(e) => updateItemRow(i, e.target.value)}
                    placeholder={`Task ${i + 1}`}
                  />
                  {itemTexts.length > 1 && (
                    <button onClick={() => removeItemRow(i)} className="text-zinc-400 hover:text-red-500 transition">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addItemRow}
              className="mt-2 text-xs text-[#F77418] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add item
            </button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          <PrimaryButton onClick={submit} disabled={!form.title}>
            <Plus className="w-4 h-4" /> Create
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}