"use client";

import React, { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import {
  PageHeader,
  Loader,
  EmptyState,
  PrimaryButton,
  GhostButton,
  Pill,
  Modal,
  Input,
  Textarea,
} from "@/components/primitives";
import { Users, Plus, Copy, Trash2, KeyRound, Edit3, Check } from "lucide-react";

interface Client {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  services?: string[];
  notes?: string;
  active?: boolean;
  last_login?: string;
}
interface Service { id: string; name: string }
interface Credentials { email: string; password: string; name: string }

interface CreateForm {
  name: string;
  email: string;
  company: string;
  phone: string;
  password: string;
  services: string[];
  notes: string;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-zinc-700 mb-1.5">{label}</div>
      {children}
    </div>
  );
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [credsModal, setCredsModal] = useState<Credentials | null>(null);
  const [form, setForm] = useState<CreateForm>({
    name: "",
    email: "",
    company: "",
    phone: "",
    password: "",
    services: [],
    notes: "",
  });
  const [error, setError] = useState("");

  const load = async () => {
    const [c, s] = await Promise.all([
      api.get<Client[]>("/admin/clients"),
      api.get<Service[]>("/services"),
    ]);
    setClients(c.data || []);
    setServices(s.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  if (!clients) return <Loader />;

  const resetForm = () =>
    setForm({ name: "", email: "", company: "", phone: "", password: "", services: [], notes: "" });

  const createClient = async () => {
    setError("");
    try {
      const { data } = await api.post<{ user: Client; generated_password: string }>(
        "/admin/clients",
        form
      );
      setCreating(false);
      resetForm();
      setCredsModal({
        email: data.user.email,
        password: data.generated_password,
        name: data.user.name,
      });
      load();
    } catch (e) {
      setError(formatApiError(e));
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setError("");
    try {
      await api.patch(`/admin/clients/${editing.id}`, {
        name: editing.name,
        company: editing.company,
        phone: editing.phone,
        services: editing.services,
        notes: editing.notes,
        active: editing.active,
      });
      setEditing(null);
      load();
    } catch (e) {
      setError(formatApiError(e));
    }
  };

  const resetPassword = async (id: string) => {
    if (!window.confirm("Generate a new password for this client?")) return;
    const { data } = await api.post<{ generated_password: string }>(
      `/admin/clients/${id}/reset-password`,
      {}
    );
    const c = clients.find((x) => x.id === id);
    if (c) setCredsModal({ email: c.email, password: data.generated_password, name: c.name });
  };

  const remove = async (id: string) => {
    if (
      !window.confirm(
        "Delete this client permanently? This cascades to their invoices, updates, tickets."
      )
    )
      return;
    await api.delete(`/admin/clients/${id}`);
    load();
  };

  const toggleService = (sid: string) => {
    if (creating) {
      const has = form.services.includes(sid);
      setForm({
        ...form,
        services: has ? form.services.filter((x) => x !== sid) : [...form.services, sid],
      });
    } else if (editing) {
      const list = editing.services || [];
      const has = list.includes(sid);
      setEditing({
        ...editing,
        services: has ? list.filter((x) => x !== sid) : [...list, sid],
      });
    }
  };

  const copyText = (txt: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(txt);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Manage"
        title="Clients"
        subtitle="Create login credentials, assign services and manage client accounts."
        action={
          <PrimaryButton
            onClick={() => {
              resetForm();
              setCreating(true);
            }}
            data-testid="new-client-button"
          >
            <Plus className="w-4 h-4" /> New client
          </PrimaryButton>
        }
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Create your first client account to get started."
          action={
            <PrimaryButton onClick={() => setCreating(true)}>
              <Plus className="w-4 h-4" /> Create client
            </PrimaryButton>
          }
        />
      ) : (
        <div className="border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Services</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Last Login</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>

                
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-zinc-100 hover:bg-zinc-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#F77418] to-[#D85F0E] text-black flex items-center justify-center text-xs font-bold">
                          {(c.name || "U")
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="font-semibold text-zinc-900">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{c.email}</td>
                    <td className="px-4 py-3 text-zinc-700">{c.company || "—"}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {(c.services || []).length} assigned
                    </td>
                    <td className="px-4 py-3">
                      <Pill status={c.active === false ? "closed" : "open"} />
                    </td>

                    <td className="px-4 py-3 text-zinc-500 text-xs">
  {c.last_login
    ? new Date(c.last_login).toLocaleString()
    : "Never"}
</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          title="Edit"
                          onClick={() => setEditing({ ...c })}
                          className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600"
                          data-testid={`edit-client-${c.id}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          title="Reset password"
                          onClick={() => resetPassword(c.id)}
                          className="p-2 rounded-md hover:bg-zinc-100 text-zinc-600"
                          data-testid={`reset-client-${c.id}`}
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => remove(c.id)}
                          className="p-2 rounded-md hover:bg-red-50 text-red-600"
                          data-testid={`delete-client-${c.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Create client account"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Full name *">
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                data-testid="client-name"
              />
            </FormField>
            <FormField label="Email *">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="client-email"
              />
            </FormField>
            <FormField label="Company">
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                data-testid="client-company"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                data-testid="client-phone"
              />
            </FormField>
          </div>
          <FormField label="Password (leave blank to auto-generate)">
            <Input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              data-testid="client-password"
              placeholder="Auto-generated if empty"
            />
          </FormField>
          <FormField label="Services">
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const on = form.services.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition ${
                      on
                        ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                        : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900"
                    }`}
                    data-testid={`toggle-service-${s.id}`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </FormField>
          <FormField label="Notes">
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </FormField>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <PrimaryButton
            onClick={createClient}
            disabled={!form.name || !form.email}
            data-testid="create-client-submit"
          >
            <Plus className="w-4 h-4" /> Create account
          </PrimaryButton>
        </div>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit client" size="lg">
        {editing && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <FormField label="Full name">
                <Input
                  value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </FormField>
              <FormField label="Email">
                <Input value={editing.email} disabled />
              </FormField>
              <FormField label="Company">
                <Input
                  value={editing.company || ""}
                  onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                />
              </FormField>
              <FormField label="Phone">
                <Input
                  value={editing.phone || ""}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="Services">
              <div className="flex flex-wrap gap-2">
                {services.map((s) => {
                  const on = (editing.services || []).includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleService(s.id)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition ${
                        on
                          ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                          : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900"
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </FormField>
            <FormField label="Notes">
              <Textarea
                rows={3}
                value={editing.notes || ""}
                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.active !== false}
                onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
              />
              <span className="text-zinc-700">Account active</span>
            </label>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <PrimaryButton onClick={saveEdit} data-testid="save-client-edit">
              <Check className="w-4 h-4" /> Save changes
            </PrimaryButton>
          </div>
        )}
      </Modal>

      <Modal open={!!credsModal} onClose={() => setCredsModal(null)} title="Client credentials">
        {credsModal && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-900">
              Copy these credentials now and share with <b>{credsModal.name}</b>. The password
              won&apos;t be shown again.
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono mb-1">
                Email
              </div>
              <div className="flex gap-2">
                <Input value={credsModal.email} readOnly />
                <GhostButton onClick={() => copyText(credsModal.email)}>
                  <Copy className="w-4 h-4" />
                </GhostButton>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono mb-1">
                Password
              </div>
              <div className="flex gap-2">
                <Input value={credsModal.password} readOnly data-testid="generated-password" />
                <GhostButton onClick={() => copyText(credsModal.password)} data-testid="copy-password">
                  <Copy className="w-4 h-4" />
                </GhostButton>
              </div>
            </div>
            <PrimaryButton
              onClick={() => copyText(`Email: ${credsModal.email}\nPassword: ${credsModal.password}`)}
            >
              <Copy className="w-4 h-4" /> Copy both
            </PrimaryButton>
          </div>
        )}
      </Modal>
    </div>
  );
}
