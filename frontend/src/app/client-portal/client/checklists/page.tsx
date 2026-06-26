"use client";

import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState } from "@/components/primitives";
import { CheckSquare, GripVertical } from "lucide-react";

interface ChecklistItem { id: string; text: string; checked: boolean; checked_by?: string | null }
interface Checklist { id: string; title: string; items: ChecklistItem[]; created_at: string }

export default function ClientChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[] | null>(null);
  const [dragState, setDragState] = useState<{ checklistId: string; itemId: string } | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const dragSavedOrder = useRef<Record<string, ChecklistItem[]>>({});

  const load = async () => {
    const res = await api.get<Checklist[]>("/client/checklists");
    setChecklists(res.data || []);
  };

  useEffect(() => { load(); }, []);
  if (!checklists) return <Loader />;

  const toggle = async (checklistId: string, itemId: string, checked: boolean) => {
    await api.patch(`/checklists/${checklistId}/items/${itemId}`, { checked });
    await load(); // ← reload to get real checked_by name from server
  };

  const persistOrder = async (checklistId: string, items: ChecklistItem[]) => {
    try {
      await api.patch(`/checklists/${checklistId}/reorder`, {
        item_ids: items.map((i) => i.id),
      });
    } catch (err) {
      // revert to last known-good order from the server on failure
      const fallback = dragSavedOrder.current[checklistId];
      if (fallback) {
        setChecklists((prev) =>
          prev
            ? prev.map((cl) => (cl.id === checklistId ? { ...cl, items: fallback } : cl))
            : prev
        );
      }
    }
  };

  const handleDragStart = (checklistId: string, itemId: string) => {
    const cl = checklists.find((c) => c.id === checklistId);
    if (cl) dragSavedOrder.current[checklistId] = cl.items;
    setDragState({ checklistId, itemId });
  };

  const handleDragOver = (e: React.DragEvent, checklistId: string, overItemId: string) => {
    e.preventDefault();
    if (!dragState || dragState.checklistId !== checklistId) return;
    if (overItemId === dragState.itemId) return;
    setDragOverItemId(overItemId);

    setChecklists((prev) => {
      if (!prev) return prev;
      return prev.map((cl) => {
        if (cl.id !== checklistId) return cl;
        const items = [...cl.items];
        const fromIdx = items.findIndex((i) => i.id === dragState.itemId);
        const toIdx = items.findIndex((i) => i.id === overItemId);
        if (fromIdx === -1 || toIdx === -1) return cl;
        const [moved] = items.splice(fromIdx, 1);
        items.splice(toIdx, 0, moved);
        return { ...cl, items };
      });
    });
  };

  const handleDragEnd = async (checklistId: string) => {
    setDragOverItemId(null);
    setDragState(null);
    const cl = checklists.find((c) => c.id === checklistId);
    if (cl) await persistOrder(checklistId, cl.items);
  };

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Tasks"
        title="Checklists"
        subtitle="Track your project tasks and progress."
      />

      {checklists.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No checklists yet" description="Your checklists will appear here." />
      ) : (
        <div className="space-y-4">
          {checklists.map((cl) => {
            const done = cl.items.filter((i) => i.checked).length;
            const pct = cl.items.length ? Math.round((done / cl.items.length) * 100) : 0;
            return (
              <div key={cl.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-display font-bold text-lg text-zinc-900">{cl.title}</div>
                  <span className="text-xs font-medium text-[#F77418]">{done}/{cl.items.length} done</span>
                </div>

                <div className="w-full h-1.5 bg-zinc-100 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-[#F77418] rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="space-y-2.5">
                  {cl.items.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(cl.id, item.id)}
                      onDragOver={(e) => handleDragOver(e, cl.id, item.id)}
                      onDrop={(e) => e.preventDefault()}
                      onDragEnd={() => handleDragEnd(cl.id)}
                      className={`flex items-center gap-2 group rounded-lg transition-colors ${
                        dragOverItemId === item.id && dragState?.itemId !== item.id
                          ? "bg-[#F77418]/5"
                          : ""
                      } ${dragState?.itemId === item.id ? "opacity-50" : ""}`}
                    >
                      <div
                        className="shrink-0 p-1 -ml-1 cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => toggle(cl.id, item.id, !item.checked)}
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
                          {item.checked_by && (
                            <span className="text-xs text-zinc-400 shrink-0">
                              {item.checked ? "✓" : "↺"} {item.checked_by}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}