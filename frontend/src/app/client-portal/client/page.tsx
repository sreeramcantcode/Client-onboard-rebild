"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { PageHeader, StatCard, Pill, Loader, EmptyState } from "@/components/primitives";
import * as Lucide from "lucide-react";
import { Receipt, Briefcase, BellRing, LifeBuoy, ArrowUpRight, Sparkles } from "lucide-react";
import { PORTAL_BASE } from "@/lib/constants";

interface Service { id: string; name: string; description: string; icon: string }
interface Update { id: string; title: string; body: string; category?: string; created_at: string }
interface InvoiceItem { description: string; qty: number; unit_price: number }
interface Invoice { id: string; number: string; total: number; items: InvoiceItem[] }
interface DashboardData {
  user: { id: string; name: string };
  open_invoices_count: number;
  pending_amount: number;
  paid_invoices_count: number;
  services: Service[];
  updates: Update[];
  open_tickets: number;
  next_invoice: Invoice | null;
}

function getIcon(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((Lucide as any)[name] || Lucide.Sparkles) as React.ComponentType<{ className?: string }>;
}

function Section({
  title,
  hint,
  link,
  children,
}: {
  title: string;
  hint?: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <h3 className="font-display font-bold text-lg text-zinc-900">{title}</h3>
          {hint && <div className="text-xs text-zinc-500">{hint}</div>}
        </div>
        {link && (
          <Link href={link.href} className="text-xs font-semibold text-[#F77418] hover:underline">
            {link.label} →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between px-4 py-3 border border-zinc-200 rounded-xl hover:border-[#F77418] hover:bg-orange-50/40 transition"
    >
      <span className="text-sm font-semibold text-zinc-900">{label}</span>
      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-[#F77418] group-hover:translate-x-0.5 transition" />
    </Link>
  );
}

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/client/dashboard").then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <Loader />;
  const u = data.user;

  return (
    <div className="p-6 md:p-10 ">
      <PageHeader
        eyebrow={`Welcome back, ${u.name?.split(" ")[0] || "client"}`}
        title="Your Rebild workspace."
        subtitle="Everything we're building for your brand, in one place."
      />

      {data.next_invoice ? (
        <div className="mb-8 rounded-2xl border border-zinc-200 overflow-hidden">
          <div className="grid md:grid-cols-[1fr,auto] gap-6 items-center bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1d] text-white p-6 md:p-8">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#F77418] font-mono mb-2">
                Action required
              </div>
              <div className="font-display font-black text-2xl md:text-3xl">
                You have 1 invoice waiting · ₹{data.pending_amount?.toFixed(2)}
              </div>
              <div className="text-sm text-zinc-400 mt-2">
                {data.next_invoice.number} · {data.next_invoice.items?.length || 0} items
              </div>
            </div>
            <Link
              href={`${PORTAL_BASE}/client/invoices`}
              className="inline-flex items-center gap-2  hover:bg-[#ff8a3d] text-black font-bold px-5 py-3 rounded-md transition"
              data-testid="dashboard-go-to-billing"
            >
              Go to billing
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className=" portal-dark mb-8 rounded-2xl border border-orange-500 p-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className=" font-display font-bold text-zinc-900">You&apos;re all set.</div>
            <div className="text-sm text-zinc-600">
              No pending invoices. Sit back — we&apos;re cooking up your next deliverable.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 fade-rise">
        <StatCard label="Active services" value={data.services?.length || 0} icon={Briefcase} accent />
        <StatCard label="Open invoices" value={data.open_invoices_count || 0} icon={Receipt} />
        <StatCard label="Paid invoices" value={data.paid_invoices_count || 0} icon={Receipt} />
        <StatCard label="Open tickets" value={data.open_tickets || 0} icon={LifeBuoy} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Your active services" hint="Engaged with Rebild.">
            {(data.services || []).length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No services assigned yet"
                description="Your account manager will assign services shortly."
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {data.services.map((s) => {
                  const Icon = getIcon(s.icon);
                  return (
                    <div
                      key={s.id}
                      className="group border border-zinc-200 rounded-xl p-4 hover:border-[#F77418] hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-md bg-[#0a0a0a] text-[#F77418] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 text-sm truncate">{s.name}</div>
                          <div className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{s.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section
            title="Latest updates"
            hint="Posted by the Rebild team."
            link={{ href: `${PORTAL_BASE}/client/updates`, label: "View all" }}
          >
            {(data.updates || []).length === 0 ? (
              <EmptyState
                icon={BellRing}
                title="No updates yet"
                description="When your account manager posts an update, it'll appear here."
              />
            ) : (
              <div className="space-y-3">
                {data.updates.map((upd) => (
                  <div
                    key={upd.id}
                    className="border border-zinc-200 rounded-xl p-4 hover:border-zinc-300 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Pill status={upd.category || "update"} />
                          <span className="text-xs text-zinc-400">
                            {new Date(upd.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-semibold text-zinc-900 mt-1.5">{upd.title}</div>
                        <div className="text-sm text-zinc-600 mt-1 line-clamp-2">{upd.body}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Working hours" hint="Indian Standard Time">
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              {[
                ["Mon - Fri", "9 AM – 7 PM"],
                ["Saturday", "10 AM – 4 PM"],
                ["Sunday", "Closed"],
              ].map(([d, h]) => (
                <div
                  key={d}
                  className="flex justify-between px-4 py-3 border-b border-zinc-100 last:border-0 text-sm"
                >
                  <span className="text-zinc-500">{d}</span>
                  <span className="font-semibold text-zinc-900 font-mono">{h}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Quick links">
            <div className="space-y-2">
              <QuickLink href={`${PORTAL_BASE}/client/invoices`} label="Billing & invoices" />
              <QuickLink href={`${PORTAL_BASE}/client/addons`} label="Browse add-ons" />
              <QuickLink href={`${PORTAL_BASE}/client/support`} label="Talk to support" />
              <QuickLink href={`${PORTAL_BASE}/client/profile`} label="Update profile" />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
