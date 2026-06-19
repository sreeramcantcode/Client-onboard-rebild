"use client";

import React, { useEffect, useState, useRef } from "react";
import api, { formatApiError } from "@/lib/api";
import {
  PageHeader,
  Loader,
  EmptyState,
  PrimaryButton,
  Pill,
  Modal,
  Input,
  Select,
  Textarea,
} from "@/components/primitives";
import { Megaphone, Plus, Trash2, Paperclip, X, FileText, Loader2, Eye } from "lucide-react";

interface Update {
  id: string;
  title: string;
  body: string;
  category: string;
  client_id: string | null;
  created_at: string;
  attachment_url?: string | null;
  attachment_name?: string | null;
}
interface Client { id: string; name: string }

export default function AdminUpdatesPage() {
  const [updates, setUpdates] = useState<Update[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    client_id: "",
    category: "Update",
    attachment_url: "",
    attachment_name: "",
});
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ← HTML preview state
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const load = async () => {
    const [u, c] = await Promise.all([
      api.get<Update[]>("/admin/updates"),
      api.get<Client[]>("/admin/clients"),
    ]);
    setUpdates(u.data || []);
    setClients(c.data || []);
  };
  useEffect(() => {
    load();
  }, []);
  if (!updates) return <Loader />;

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

    try {
      await api.post("/admin/updates", {
        title: form.title,
        body: form.body,
        client_id: form.client_id || null,
        category: form.category,
        attachment_url: attachment_url || null,
        attachment_name: attachment_name || null,
      });

      setCreating(false);
      setForm({ title: "", body: "", client_id: "", category: "Update", attachment_url: "", attachment_name: "" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load();
    } catch (e) {
      setError(formatApiError(e));
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this update?")) return;
    await api.delete(`/admin/updates/${id}`);
    load();
  };

  // ← HTML preview handlers
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

  const isSubmitting = uploading;

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Communication"
        title="Updates & reports"
        subtitle="Broadcast announcements, share progress, drop performance reports."
        action={
          <PrimaryButton onClick={() => setCreating(true)} data-testid="new-update-button">
            <Plus className="w-4 h-4" /> Post update
          </PrimaryButton>
        }
      />

      {updates.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No updates yet"
          description="Post your first update or report to your clients."
        />
      ) : (
        <div className="space-y-3">
          {updates.map((u) => {
            const target = u.client_id
              ? clients.find((c) => c.id === u.client_id)?.name || "Client"
              : "All clients";
            const isHtml = u.attachment_name?.toLowerCase().endsWith(".html");

            return (
              <div
                key={u.id}
                className="border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Pill status={u.category} />
                      <span className="text-xs text-zinc-500 font-mono">→ {target}</span>
                      <span className="text-xs text-zinc-400">
                        · {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-display font-bold text-lg text-zinc-900 mt-1.5">
                      {u.title}
                    </div>
                    <div className="text-sm text-zinc-600 mt-1 whitespace-pre-line">{u.body}</div>

                    {u.attachment_url && (
                      isHtml ? (
                        <button
                          onClick={() => openHtmlPreview(u.attachment_url!)}
                          disabled={loadingPreview}
                          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#F77418]" />
                          {loadingPreview ? "Loading..." : (u.attachment_name || "View attachment")}
                        </button>
                      ) : (
                        <a
                        
                          href={u.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#F77418]" />
                          {u.attachment_name || "View attachment"}
                        </a>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => remove(u.id)}
                    className="p-2 rounded-md hover:bg-red-50 text-red-600 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Post update / report"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-zinc-700 mb-1.5">Recipient</div>
              <Select
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                data-testid="update-target"
              >
                <option value="">📣 All clients (broadcast)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-700 mb-1.5">Category</div>
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option>Update</option>
                <option>Report</option>
                <option>Announcement</option>
              </Select>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Title</div>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              data-testid="update-title"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Message</div>
            <Textarea
              rows={6}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              data-testid="update-body"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">
              Attachment <span className="font-normal text-zinc-400">(PDF, Word, or HTML, max 10MB)</span>
            </div>

            {!selectedFile ? (
              <label className="flex items-center gap-2 w-fit cursor-pointer px-3 py-2 rounded-lg border border-dashed border-zinc-300 hover:border-[#F77418] hover:bg-orange-50 text-zinc-500 hover:text-[#F77418] text-sm transition">
                <Paperclip className="w-4 h-4" />
                Attach file
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.html,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/html"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 w-fit">
                <FileText className="w-4 h-4 text-[#F77418] shrink-0" />
                <span className="text-sm text-zinc-700 max-w-[220px] truncate">{selectedFile.name}</span>
                <span className="text-xs text-zinc-400">
                  ({(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
                <button onClick={clearFile} className="ml-1 text-zinc-400 hover:text-red-500 transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {uploadError && (
              <div className="text-xs text-red-600 mt-1">{uploadError}</div>
            )}
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <PrimaryButton
            onClick={submit}
            disabled={!form.title || !form.body}
            data-testid="post-update-submit"
          >
            <Plus className="w-4 h-4" /> Post
          </PrimaryButton>
        </div>
      </Modal>

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