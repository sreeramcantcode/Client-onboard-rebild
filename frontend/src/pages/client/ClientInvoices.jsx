import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState, Pill, PrimaryButton, Modal } from "@/components/Primitives";
import { Receipt, Download, CheckCircle2 } from "lucide-react";
import RebildLogo, { RebildMarkOnLight } from "@/components/RebildLogo";

export default function ClientInvoices() {
    const [invoices, setInvoices] = useState(null);
    const [open, setOpen] = useState(null);
    const [me, setMe] = useState(null);

    const load = async () => {
        const [i, m] = await Promise.all([api.get("/client/invoices"), api.get("/auth/me")]);
        setInvoices(i.data || []);
        setMe(m.data);
    };
    useEffect(() => { load(); }, []);

    if (!invoices || !me) return <Loader />;

    const pay = async (id) => {
        await api.post(`/client/invoices/${id}/pay`);
        load();
        setOpen(null);
    };

    return (
        <div className="p-6 md:p-10">
            <PageHeader
                eyebrow="Billing"
                title="Invoices"
                subtitle="All your invoices, in one tidy place."
            />

            {invoices.length === 0 ? (
                <EmptyState
                    icon={Receipt}
                    title="No invoices yet"
                    description="When your account manager issues an invoice, it'll appear here."
                />
            ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                                <tr>
                                    <th className="text-left px-4 py-3">Invoice</th>
                                    <th className="text-left px-4 py-3">Amount</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Created</th>
                                    <th className="text-left px-4 py-3">Due</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="border-t border-zinc-100 hover:bg-zinc-50/50 transition">
                                        <td className="px-4 py-4 font-mono font-semibold text-zinc-900">{inv.number}</td>
                                        <td className="px-4 py-4 font-display font-bold text-zinc-900">${inv.total?.toFixed(2)}</td>
                                        <td className="px-4 py-4"><Pill status={inv.status} /></td>
                                        <td className="px-4 py-4 text-zinc-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 text-zinc-500">{inv.due_date || "—"}</td>
                                        <td className="px-4 py-4 text-right">
                                            <button
                                                onClick={() => setOpen(inv)}
                                                data-testid={`view-invoice-${inv.id}`}
                                                className="text-sm font-semibold text-[#F77418] hover:underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal open={!!open} onClose={() => setOpen(null)} title={`Invoice ${open?.number || ""}`} size="lg">
                {open && (
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <RebildMarkOnLight size="lg" />
                            <div className="text-right">
                                <Pill status={open.status} />
                                <div className="text-xs text-zinc-500 mt-2 font-mono">{open.number}</div>
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">From</div>
                                <div className="font-semibold text-zinc-900 mt-1">Rebild Marketing</div>
                                <div className="text-zinc-500 text-xs mt-1">billing@rebild.com</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Billed to</div>
                                <div className="font-semibold text-zinc-900 mt-1">{me.name}</div>
                                <div className="text-zinc-500 text-xs mt-1">{me.email}</div>
                                {me.company && <div className="text-zinc-500 text-xs">{me.company}</div>}
                            </div>
                        </div>

                        <div className="border border-zinc-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                                    <tr>
                                        <th className="text-left px-4 py-3">Description</th>
                                        <th className="text-right px-4 py-3 w-16">Qty</th>
                                        <th className="text-right px-4 py-3 w-28">Unit price</th>
                                        <th className="text-right px-4 py-3 w-28">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(open.items || []).map((it, i) => (
                                        <tr key={i} className="border-t border-zinc-100">
                                            <td className="px-4 py-3 text-zinc-900">{it.description}</td>
                                            <td className="px-4 py-3 text-right text-zinc-700">{it.qty}</td>
                                            <td className="px-4 py-3 text-right text-zinc-700 font-mono">${it.unit_price?.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-mono text-zinc-900">${(it.unit_price * it.qty).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <div className="w-full sm:w-72 space-y-2 text-sm">
                                <div className="flex justify-between text-zinc-600">
                                    <span>Subtotal</span>
                                    <span className="font-mono">${open.subtotal?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-600">
                                    <span>Tax</span>
                                    <span className="font-mono">${open.tax?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-zinc-200 pt-2 font-display font-bold text-lg text-zinc-900">
                                    <span>Total</span>
                                    <span>${open.total?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {open.memo && (
                            <div className="mt-6 text-sm bg-zinc-50 border border-zinc-200 rounded-md p-4">
                                <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono mb-1">Memo</div>
                                <div className="text-zinc-700">{open.memo}</div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 border border-zinc-300 hover:border-zinc-900 px-4 py-2.5 rounded-md text-sm font-semibold"
                                data-testid="print-invoice"
                            >
                                <Download className="w-4 h-4" /> Download / Print
                            </button>
                            {open.status === "open" && (
                                <PrimaryButton onClick={() => pay(open.id)} data-testid="pay-invoice-button">
                                    <CheckCircle2 className="w-4 h-4" /> Mark as paid
                                </PrimaryButton>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
