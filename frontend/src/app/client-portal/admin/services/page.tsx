"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  PageHeader,
  Loader,
  EmptyState,
  PrimaryButton,
  Modal,
  Input,
  Textarea,
} from "@/components/primitives";
import * as Lucide from "lucide-react";
import { Plus, Trash2, Layers } from "lucide-react";

interface Service { id: string; name: string; description: string; icon: string }

function getIcon(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((Lucide as any)[name] || Lucide.Sparkles) as React.ComponentType<{ className?: string }>;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "Sparkles",
    color: "#F77418",
  });

  const load = async () => {
    const r = await api.get<Service[]>("/services");
    setServices(r.data || []);
  };
  useEffect(() => {
    load();
  }, []);
  if (!services) return <Loader />;

  const submit = async () => {
    await api.post("/admin/services", form);
    setCreating(false);
    setForm({ name: "", description: "", icon: "Sparkles", color: "#F77418" });
    load();
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this service?")) return;
    await api.delete(`/admin/services/${id}`);
    load();
  };

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        eyebrow="Catalog"
        title="Services"
        subtitle="Manage the services your agency offers. Assign these to clients on creation."
        action={
          <PrimaryButton onClick={() => setCreating(true)} data-testid="new-service-button">
            <Plus className="w-4 h-4" /> New service
          </PrimaryButton>
        }
      />
      {services.length === 0 ? (
        <EmptyState icon={Layers} title="No services yet" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <div
                key={s.id}
                className="border border-zinc-200 rounded-xl p-4 flex items-start gap-3 group"
              >
                <div className="w-10 h-10 rounded-md bg-[#0a0a0a] text-[#F77418] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-zinc-900 truncate">{s.name}</div>
                  <div className="text-xs text-zinc-500 line-clamp-2">{s.description}</div>
                </div>
                <button
                  onClick={() => remove(s.id)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New service">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Name</div>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              data-testid="service-name"
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Description</div>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Lucide icon name</div>
            <Input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="e.g. Camera, Video, Megaphone"
            />
          </div>
          <PrimaryButton onClick={submit} disabled={!form.name} data-testid="create-service-submit">
            <Plus className="w-4 h-4" /> Create
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
