"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState, Pill , Modal } from "@/components/primitives";
import { BellRing, FileText } from "lucide-react";

interface Update {
  id: string;
  title: string;
  body: string;
  category?: string;
  created_at: string;
}

export default function ClientUpdatesView({ filterCategory }: { filterCategory?: string }) {
  const [updates, setUpdates] = useState<Update[] | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any | null>(null);

  useEffect(() => {
    api.get<Update[]>("/client/updates").then((r) => setUpdates(r.data || []));
  }, []);

  if (!updates) return <Loader />;

  const filtered = filterCategory
    ? updates.filter((u) => (u.category || "").toLowerCase() === filterCategory.toLowerCase())
    : updates;

  const isReports = filterCategory === "Report";

  return (
    <div className="p-7 md:p-10">
      <PageHeader
        eyebrow={isReports ? "Performance" : "Newsroom"}
        title={isReports ? "Reports" : "Updates"}
        subtitle={
          isReports
            ? "Performance reports & insights from your account manager."
            : "Everything new from your Rebild team."
        }
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={isReports ? FileText : BellRing}
          title={isReports ? "No reports yet" : "No updates yet"}
          description={
            isReports
              ? "Reports will appear here once we publish them."
              : "When the team shares an update, it'll appear here."
          }
        />
      ) : (
        <div className="relative pl-6 sm:pl-10">
          <div className="absolute left-2 sm:left-4 top-2 bottom-2 w-px bg-zinc-200" />
          <div className="space-y-6">
            {filtered.map((u) => (
              <div key={u.id} className="relative">
                <div className="absolute -left-[18px] sm:-left-[26px] top-3 w-3 h-3 rounded-full bg-[#F77418] ring-4 ring-orange-50" />
                 <div
  onClick={() => setSelectedUpdate(u)}
  className="cursor-pointer border border-zinc-200 rounded-2xl p-5 hover:border-[#F77418]/40 hover:shadow-md transition"
>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Pill status={u.category || "update"} />
                    <span className="text-xs text-zinc-400 font-mono">
                      {new Date(u.created_at).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="font-display font-bold text-lg text-zinc-900 mt-2">{u.title}</div>
                  <div className="text-sm text-zinc-600 mt-2 whitespace-pre-line">{u.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      )}
     
     <Modal
  open={!!selectedUpdate}
  onClose={() => setSelectedUpdate(null)}
  title={selectedUpdate?.title || "Update"}
>
  {selectedUpdate && (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Pill status={selectedUpdate.category || "update"} />

        <span className="text-xs text-zinc-500 font-mono">
          {new Date(selectedUpdate.created_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      <div className="text-2xl font-bold text-white">
        {selectedUpdate.title}
      </div>

      <div className="text-sm leading-7 text-zinc-300 whitespace-pre-line">
        {selectedUpdate.body}
      </div>
    </div>
  )}
</Modal>
      
    </div>
  );
}
