import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { PageHeader, StatCard, Loader, Pill } from "@/components/Primitives";
import { Users, Receipt, DollarSign, Ticket, ArrowUpRight, Plus, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/admin/stats").then((r) => setStats(r.data));
    }, []);

    if (!stats) return <Loader />;

    return (
        <div className="p-6 md:p-10">
            <PageHeader
                eyebrow="Agency control room"
                title="Welcome back, team."
                subtitle="Everything happening across your Rebild clients."
                action={
                    <Link
                        to="/admin/clients"
                        className="inline-flex items-center gap-2 bg-[#F77418] hover:bg-[#ff8a3d] text-black font-semibold rounded-md px-4 py-2.5 text-sm"
                        data-testid="dashboard-new-client"
                    >
                        <Plus className="w-4 h-4" /> New client
                    </Link>
                }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Clients" value={stats.total_clients} hint={`${stats.active_clients} active`} icon={Users} accent />
                <StatCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} hint="Total paid" icon={DollarSign} />
                <StatCard label="Open invoices" value={stats.open_invoices} hint={`$${stats.pending_revenue.toLocaleString()} pending`} icon={Receipt} />
                <StatCard label="Open tickets" value={stats.open_tickets} hint={`${stats.addon_pending} add-on requests`} icon={Ticket} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border border-zinc-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-display font-bold text-lg text-zinc-900">Recent invoices</h3>
                            <div className="text-xs text-zinc-500">Latest 5 invoices</div>
                        </div>
                        <Link to="/admin/invoices" className="text-xs font-semibold text-[#F77418] hover:underline">
                            All invoices →
                        </Link>
                    </div>
                    {stats.recent_invoices?.length === 0 ? (
                        <div className="text-sm text-zinc-500 py-6">No invoices yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {stats.recent_invoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 border border-zinc-100 rounded-lg hover:border-zinc-200 transition">
                                    <div className="min-w-0">
                                        <div className="font-mono text-sm font-semibold text-zinc-900">{inv.number}</div>
                                        <div className="text-xs text-zinc-500 truncate">{inv.client_name}</div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="font-display font-bold text-zinc-900">${inv.total?.toFixed(2)}</div>
                                        <Pill status={inv.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="border border-zinc-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display font-bold text-lg text-zinc-900">Recent tickets</h3>
                        <Link to="/admin/tickets" className="text-xs font-semibold text-[#F77418] hover:underline">View →</Link>
                    </div>
                    {stats.recent_tickets?.length === 0 ? (
                        <div className="text-sm text-zinc-500 py-6">No tickets.</div>
                    ) : (
                        <div className="space-y-2">
                            {stats.recent_tickets.map((t) => (
                                <div key={t.id} className="p-3 border border-zinc-100 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Pill status={t.status} />
                                    </div>
                                    <div className="font-semibold text-sm text-zinc-900 truncate">{t.subject}</div>
                                    <div className="text-xs text-zinc-500 mt-0.5 truncate">{t.client_name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
