"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState } from "@/components/primitives";
import { CheckSquare } from "lucide-react";

interface ChecklistItem { id: string; text: string; checked: boolean ; checked_by?: string | null  }
interface Checklist { id: string; title: string; items: ChecklistItem[]; created_at: string }

export default function ClientChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[] | null>(null);

  const load = async () => {
    const res = await api.get<Checklist[]>("/client/checklists");
    setChecklists(res.data || []);
  };

  useEffect(() => { load(); }, []);
  if (!checklists) return <Loader />;

  const toggle = async (checklistId: string, itemId: string, checked: boolean) => {
    // optimistic update
    setChecklists((prev) =>
      prev!.map((cl) =>
        cl.id !== checklistId ? cl : {
          ...cl,
          items: cl.items.map((it) => 
  it.id === itemId 
    ? { ...it, checked, checked_by: checked ? "You" : null } 
    : it
),
        }
      )
    );
    await api.patch(`/checklists/${checklistId}/items/${itemId}`, { checked });
  };

  return (
    <div className="p-6 md:p-9">
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
              <div key={cl.id} className="border space-y-4 border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-display font-bold text-lg text-zinc-900">{cl.title}</div>
                  <span className="text-xs font-medium text-[#F77418]">{done}/{cl.items.length} done</span>
                </div>

                {/* Progress bar */}
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
  className={`flex items-center gap-3 group ${!item.checked ? "cursor-pointer" : "cursor-default"}`}
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
            );
          })}
        </div>
      )}
    </div>
  );
}