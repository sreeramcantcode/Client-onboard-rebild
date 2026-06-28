"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState } from "@/components/primitives";
import {
  FileText, Eye, Download,
  Image as ImageIcon, FileSpreadsheet, Link2, File as FileIcon,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
  link_url?: string | null;
  created_at: string;
}

// Same mapping as the admin page, kept in sync so icons/colors match across both views.
function getFileVisual(doc: Document) {
  if (doc.link_url) {
    return { Icon: Link2, classes: "bg-blue-50 text-blue-500" };
  }
  const name = doc.attachment_name?.toLowerCase() || "";
  if (name.endsWith(".pdf")) {
    return { Icon: FileText, classes: "bg-red-50 text-red-500" };
  }
  if (name.endsWith(".doc") || name.endsWith(".docx")) {
    return { Icon: FileText, classes: "bg-blue-50 text-blue-600" };
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")) {
    return { Icon: FileSpreadsheet, classes: "bg-emerald-50 text-emerald-600" };
  }
  if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].some((ext) => name.endsWith(ext))) {
    return { Icon: ImageIcon, classes: "bg-orange-50 text-[#F77418]" };
  }
  if (name.endsWith(".html")) {
    return { Icon: FileText, classes: "bg-orange-50 text-[#F77418]" };
  }
  return { Icon: FileIcon, classes: "bg-zinc-100 text-zinc-500" };
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[] | null>(null);

  // ← preview state
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);

  const openHtmlPreview = async (id: string, url: string) => {
    setLoadingPreviewId(id);
    try {
      const res = await fetch(url);
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html" });
      const blobUrl = URL.createObjectURL(blob);
      setIframeUrl(blobUrl);
    } catch {
      window.open(url, "_blank");
    } finally {
      setLoadingPreviewId(null);
    }
  };

  const closePreview = () => {
    if (iframeUrl) URL.revokeObjectURL(iframeUrl);
    setIframeUrl(null);
  };

  // Lock background scroll + close on Escape while the preview is open
  useEffect(() => {
    if (!iframeUrl) return;

    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [iframeUrl]);

  useEffect(() => {
    api.get<Document[]>("/client/documents").then((r) => setDocuments(r.data || []));
  }, []);

  if (!documents) return <Loader />;

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Files"
        title="Documents"
        subtitle="Files and reports shared by your Rebild team."
      />

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Documents shared with you will appear here." />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const isLink = !!doc.link_url;
            const name = doc.attachment_name?.toLowerCase() || "";
            const isHtml = !isLink && name.endsWith(".html");
            const isPdfOrImage =
              !isLink &&
              (name.endsWith(".pdf") ||
                name.endsWith(".jpg") ||
                name.endsWith(".jpeg") ||
                name.endsWith(".png") ||
                name.endsWith(".gif") ||
                name.endsWith(".webp"));

            const { Icon, classes } = getFileVisual(doc);

            return (
              <div key={doc.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-[#F77418]/30 hover:shadow-sm transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${classes}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 truncate">{doc.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 truncate">
                        {isLink ? doc.link_url : doc.attachment_name} · {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isLink ? (
                      <a
                        href={doc.link_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Open link
                      </a>
                    ) : isHtml ? (
                      <button
                        onClick={() => openHtmlPreview(doc.id, doc.attachment_url!)}
                        disabled={loadingPreviewId === doc.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {loadingPreviewId === doc.id ? "Loading..." : "View"}
                      </button>
                    ) : isPdfOrImage ? (
                      <a
                        href={doc.attachment_url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                    ) : null}

                    {/* Download only makes sense for actual files, not links */}
                    {!isLink && (
                      <a
                        href={doc.attachment_url!}
                        download={doc.attachment_name!}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F77418] hover:bg-[#e06810] text-white transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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