"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState } from "@/components/primitives";
import { FileText, Eye, Download } from "lucide-react";

interface Document {
  id: string;
  title: string;
  attachment_url: string;
  attachment_name: string;
  created_at: string;
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
const [loadingPreview, setLoadingPreview] = useState(false);

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
            const isHtml = doc.attachment_name?.toLowerCase().endsWith(".html");
            const isPdfOrImage =
              doc.attachment_name?.toLowerCase().endsWith(".pdf") ||
              doc.attachment_name?.toLowerCase().endsWith(".jpg") ||
              doc.attachment_name?.toLowerCase().endsWith(".jpeg") ||
              doc.attachment_name?.toLowerCase().endsWith(".png") ||
              doc.attachment_name?.toLowerCase().endsWith(".gif") ||
              doc.attachment_name?.toLowerCase().endsWith(".webp");

            return (
              <div key={doc.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-[#F77418]/30 hover:shadow-sm transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#F77418]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 truncate">{doc.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {doc.attachment_name} · {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* HTML → iframe modal */}
                    {isHtml && (
  <button
    onClick={() => openHtmlPreview(doc.attachment_url)}
    disabled={loadingPreview}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
  >
    <Eye className="w-3.5 h-3.5" />
    {loadingPreview ? "Loading..." : "View"}
  </button>
)}
                    {/* PDF / images → open in new tab */}
                    {isPdfOrImage && (
                      <a
                        href={doc.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                    )}

                     <a
                      href={doc.attachment_url}
                      download={doc.attachment_name}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F77418] hover:bg-[#e06810] text-white transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
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
              <button onClick={closePreview}
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