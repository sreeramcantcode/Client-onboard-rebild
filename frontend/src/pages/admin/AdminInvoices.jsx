import React, { useEffect, useState } from "react";
import api, { formatApiError } from "@/lib/api";
import { PageHeader, Loader, EmptyState, PrimaryButton, Pill, Modal, Input, Select, Textarea } from "@/components/Primitives";
import { Receipt, Plus, Trash2, CheckCircle2 } from "lucide-react";

export default function AdminInvoices() {
    const [invoices, setInvoices] = useState(null);
    const [clients, setClients] = useState([]);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ client_id: "", items: [{ description: "", qty: 1, unit_price: 0 }], tax: 0, due_date: "", memo: "" });
    const [error, setError] = useState("");

    const load = async () => {
        const [i, c] = await Promise.all([api.get("/admin/invoices"), api.get("/admin/clients")]);
        setInvoices(i.data || []);
        setClients(c.data || []);
    };
    useEffect(() => { load(); }, []);

    if (!invoices) return <Loader />;

    const total = form.items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unit_price) || 0), 0) + Number(form.tax || 0);

    const submit = async () => {
        setError("");
        try {
            await api.post("/admin/invoices", {
                ...form,
                items: form.items.map((it) => ({ description: it.description, qty: Number(it.qty), unit_price: Number(it.unit_price) })),
                tax: Number(form.tax || 0),
            });
            setCreating(false);
            setForm({ client_id: "", items: [{ description: "", qty: 1, unit_price: 0 }], tax: 0, due_date: "", memo: "" });
            load();
        } catch (e) { setError(formatApiError(e)); }
    };

    const markPaid = async (id) => {
        await api.post(`/admin/invoices/${id}/mark-paid`); load();
    };
    const remove = async (id) => {
        if (!window.confirm("Delete this invoice?")) return;
        await api.delete(`/admin/invoices/${id}`); load();
    };

    return (
        <div className="p-6 md:p-10">
            <PageHeader
                eyebrow="Billing"
                title="Invoices"
                subtitle="Issue invoices, track payments, and manage your agency cashflow."
                action={
                    <PrimaryButton onClick={() => setCreating(true)} disabled={clients.length === 0} data-testid="new-invoice-button">
                        <Plus className="w-4 h-4" /> Create invoice
                    </PrimaryButton>
                }
            />

            {invoices.length === 0 ? (
                <EmptyState icon={Receipt} title="No invoices yet" description={clients.length === 0 ? "Create a client first, then issue an invoice." : "Issue your first invoice to a client."} />
            ) : (
                <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                                <tr>
                                    <th className="text-left px-4 py-3">Invoice</th>
                                    <th className="text-left px-4 py-3">Client</th>
                                    <th className="text-left px-4 py-3">Amount</th>
                                    <th className="text-left px-4 py-3">Status</th>
                                    <th className="text-left px-4 py-3">Created</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="border-t border-zinc-100 hover:bg-zinc-50/50">
                                        <td className="px-4 py-3 font-mono font-semibold text-zinc-900">{inv.number}</td>
                                        <td className="px-4 py-3 text-zinc-900">{inv.client_name}</td>
                                        <td className="px-4 py-3 font-display font-bold text-zinc-900">${inv.total?.toFixed(2)}</td>
                                        <td className="px-4 py-3"><Pill status={inv.status} /></td>
                                        <td className="px-4 py-3 text-zinc-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                {inv.status === "open" && (
                                                    <button title="Mark as paid" onClick={() => markPaid(inv.id)} className="p-2 rounded-md hover:bg-emerald-50 text-emerald-700" data-testid={`mark-paid-${inv.id}`}><CheckCircle2 className="w-4 h-4" /></button>
                                                )}
                                                <button title="Delete" onClick={() => remove(inv.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal open={creating} onClose={() => setCreating(false)} title="Create invoice" size="lg">
                <div className="space-y-4">
                    <div>
                        <div className="text-xs font-semibold text-zinc-700 mb-1.5">Client *</div>
                        <Select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} data-testid="invoice-client">
                            <option value="">— Select client —</option>
                            {clients.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.email})</option>))}
                        </Select>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-zinc-700 mb-1.5">Items</div>
                        <div className="space-y-2">
                            {form.items.map((it, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                    <Input className="col-span-6" placeholder="Description" value={it.description} onChange={(e) => { const items = [...form.items]; items[i].description = e.target.value; setForm({ ...form, items }); }} data-testid={`item-desc-${i}`} />
                                    <Input className="col-span-2" type="number" min="1" placeholder="Qty" value={it.qty} onChange={(e) => { const items = [...form.items]; items[i].qty = e.target.value; setForm({ ...form, items }); }} data-testid={`item-qty-${i}`} />
                                    <Input className="col-span-3" type="number" step="0.01" placeholder="Unit price" value={it.unit_price} onChange={(e) => { const items = [...form.items]; items[i].unit_price = e.target.value; setForm({ ...form, items }); }} data-testid={`item-price-${i}`} />
                                    <button onClick={() => setForm({ ...form, items: form.items.filter((_, j) => j !== i) })} className="col-span-1 text-zinc-400 hover:text-red-600" disabled={form.items.length === 1}>
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, items: [...form.items, { description: "", qty: 1, unit_price: 0 }] })}
                                className="text-sm font-semibold text-[#F77418] hover:underline"
                                data-testid="add-line-item"
                            >
                                + Add line item
                            </button>
                        </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Tax</div>
                            <Input type="number" step="0.01" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-zinc-700 mb-1.5">Due date</div>
                            <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-zinc-700 mb-1.5">Memo</div>
                        <Textarea rows={2} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-100 pt-4">
                        <div className="text-sm text-zinc-600">Total</div>
                        <div className="font-display font-black text-2xl text-zinc-900">${total.toFixed(2)}</div>
                    </div>
                    {error && <div className="text-sm text-red-600">{error}</div>}
                    <PrimaryButton onClick={submit} disabled={!form.client_id || !form.items.some((it) => it.description)} data-testid="create-invoice-submit">
                        <Plus className="w-4 h-4" /> Issue invoice
                    </PrimaryButton>
                </div>
            </Modal>
        </div>
    );
}
