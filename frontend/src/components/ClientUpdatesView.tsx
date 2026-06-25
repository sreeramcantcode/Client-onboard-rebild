
"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState, Pill, Modal, Modalup } from "@/components/primitives";
import { BellRing, FileText, Eye } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

interface Update {
  id: string;
  title: string;
  body: string;
  category?: string;
  created_at: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
}

export default function ClientUpdatesView({ filterCategory }: { filterCategory?: string }) {
  const [updates, setUpdates] = useState<Update[] | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<any | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // HTML preview state
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    api.get<Update[]>("/client/updates").then((r) => setUpdates(r.data || []));
  }, []);

  if (!updates) return <Loader />;

  const filtered = (
    filterCategory
      ? updates.filter(
          (u) =>
            (u.category || "").toLowerCase() ===
            filterCategory.toLowerCase()
        )
      : updates
  ).sort((a, b) =>
    sortOrder === "newest"
      ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const isReports = filterCategory === "Report";

  // HTML preview handlers
  const openHtmlPreview = async (url: string) => {
    setLoadingPreview(true);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      setIframeUrl(blobUrl);
    } catch {
      window.open(url, "_blank");
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    if (iframeUrl) URL.revokeObjectURL(iframeUrl);
    setIframeUrl(null);
  };

  // Reusable attachment chip renderer
  const renderAttachmentChip = (u: Update, stopProp: boolean) => {
    if (!u.attachment_url) return null;
    const isHtml = u.attachment_name?.toLowerCase().endsWith(".html");

    if (isHtml) {
      return (
        <button
          onClick={(e) => {
            if (stopProp) e.stopPropagation();
            openHtmlPreview(u.attachment_url!);
          }}
          disabled={loadingPreview}
          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium transition"
        >
          <Eye className="w-3.5 h-3.5 text-[#F77418]" />
          {loadingPreview ? "Loading..." : (u.attachment_name || "View attachment")}
        </button>
      );
    }

    return (
      <a 
        href={u.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => stopProp && e.stopPropagation()}
        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium transition"
      >
        <Eye className="w-3.5 h-3.5 text-[#F77418]" />
        {u.attachment_name || "View attachment"}
      </a>
    );
  };

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

      <div className="flex justify-end mb-6">
        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
          }
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-zinc-200 hover:border-[#F77418]/40 hover:bg-zinc-50 transition"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort by {sortOrder === "newest" ? "Newest" : "Oldest"}
        </button>
      </div>

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
                  <div className="mt-2">
                    <div className="text-sm text-zinc-600 whitespace-pre-line line-clamp-1">
                      {u.body}
                    </div>

                    {u.body.length > 80 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUpdate(u);
                        }}
                        className="mt-2 text-sm font-semibold text-[#F77418] hover:underline"
                      >
                        Read more
                      </button>
                    )}
                  </div>

                  {/* attachment chip on the card — works for any file type */}
                  {renderAttachmentChip(u, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modalup
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

            {renderAttachmentChip(selectedUpdate, false)}
          </div>
        )}
      </Modalup>

      {/* HTML preview modal */}
      {iframeUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-200">
              <span className="font-semibold text-zinc-900 text-sm">Preview</span>
              <button
                onClick={closePreview}
                className="text-zinc-400 hover:text-zinc-700 transition text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <iframe
              src={iframeUrl}
              className="flex-1 w-full"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      )}
    </div>
  );
}