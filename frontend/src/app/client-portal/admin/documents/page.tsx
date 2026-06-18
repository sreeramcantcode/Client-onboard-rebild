"use client";

import React, { useEffect, useState, useRef } from "react";
import api, { formatApiError } from "@/lib/api";
import {
  PageHeader, Loader, EmptyState, PrimaryButton, Modal, Input, Select,
} from "@/components/primitives";
import { FileText, Plus, Trash2, Paperclip, X, Loader2 } from "lucide-react";

interface Document {
  id: string;
  title: string;
  client_id: string | null;
  attachment_url: string;
  attachment_name: string;
  created_at: string;
}
interface Client { id: string; name: string }

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", client_id: "", attachment_url: "", attachment_name: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const [d, c] = await Promise.all([
      api.get<Document[]>("/admin/documents"),
      api.get<Client[]>("/admin/clients"),
    ]);
    setDocuments(d.data || []);
    setClients(c.data || []);
  };

  useEffect(() => { load(); }, []);
  if (!documents) return <Loader />;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadError("");
    setForm((f) => ({ ...f, attachment_url: "", attachment_name: "" }));
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadError("");
    setForm((f) => ({ ...f, attachment_url: "", attachment_name: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = async () => {
    setError("");
    setUploadError("");

    let attachment_url = form.attachment_url;
    let attachment_name = form.attachment_name;

    if (selectedFile && !attachment_url) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await api.post<{ url: string; filename: string }>(
          "/admin/uploads",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        attachment_url = res.data.url;
        attachment_name = res.data.filename;
      } catch (e) {
        setUploadError("File upload failed: " + formatApiError(e));
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (!attachment_url) {
      setError("Please attach a file");
      return;
    }

    try {
      await api.post("/admin/documents", {
        title: form.title,
        client_id: form.client_id || null,
        attachment_url,
        attachment_name,
      });
      setCreating(false);
      setForm({ title: "", client_id: "", attachment_url: "", attachment_name: "" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (e) {
      setError(formatApiError(e));
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this document?")) return;
    await api.delete(`/admin/documents/${id}`);
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Files"
        title="Documents"
        subtitle="Upload and share documents with your clients."
        action={
          <PrimaryButton onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4" /> Upload document
          </PrimaryButton>
        }
      />

      {documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Upload your first document." />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const target = doc.client_id
              ? clients.find((c) => c.id === doc.client_id)?.name || "Client"
              : "All clients";
            const isPdf = doc.attachment_name?.toLowerCase().endsWith(".pdf");
            return (
              <div key={doc.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#F77418]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-900 truncate">{doc.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {doc.attachment_name} · → {target} · {new Date(doc.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    
                     <a href={doc.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
                    >
                      {isPdf ? "View" : "Download"}
                    </a>
                    <button onClick={() => remove(doc.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="Upload document" size="lg">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-700 mb-1.5">Title</div>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Q1 Performance Report"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-700 mb-1.5">Recipient</div>
              <select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F77418]"
              >
                <option value="">All clients</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">
              File <span className="font-normal text-zinc-400">(PDF or Word, max 10MB)</span>
            </div>
            {!selectedFile ? (
              <label className="flex items-center gap-2 w-fit cursor-pointer px-3 py-2 rounded-lg border border-dashed border-zinc-300 hover:border-[#F77418] hover:bg-orange-50 text-zinc-500 hover:text-[#F77418] text-sm transition">
                <Paperclip className="w-4 h-4" />
                Attach file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.html,.jpg,.jpeg,.png,.gif,.webp,.xlsx,.xls,.csv,.txt,text/html,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 w-fit">
                <FileText className="w-4 h-4 text-[#F77418] shrink-0" />
                <span className="text-sm text-zinc-700 max-w-[220px] truncate">{selectedFile.name}</span>
                <span className="text-xs text-zinc-400">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                <button onClick={clearFile} className="ml-1 text-zinc-400 hover:text-red-500 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {uploadError && <div className="text-xs text-red-600 mt-1">{uploadError}</div>}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <PrimaryButton
            onClick={submit}
            disabled={!form.title || !selectedFile || uploading}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
            ) : (
              <><Plus className="w-4 h-4" /> Upload</>
            )}
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}