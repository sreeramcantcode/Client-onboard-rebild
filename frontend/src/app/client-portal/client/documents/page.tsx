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
            const isViewable = doc.attachment_name?.toLowerCase().endsWith(".pdf") || 
                   doc.attachment_name?.toLowerCase().endsWith(".html");
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
                    {isViewable && (
                      
                      <a href={doc.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </a>
                    )}
                    
                     <a href={doc.attachment_url}
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
    </div>
  );
}