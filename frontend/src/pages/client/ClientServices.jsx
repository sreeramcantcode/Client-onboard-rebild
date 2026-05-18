import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { PageHeader, Loader, EmptyState, Pill } from "@/components/Primitives";
import * as LucideIcons from "lucide-react";
import { Briefcase, CheckCircle2 } from "lucide-react";

function getIcon(name) {
    return LucideIcons[name] || LucideIcons.Sparkles;
}

export default function ClientServices() {
    const [services, setServices] = useState(null);
    const [allServices, setAllServices] = useState([]);
    const [me, setMe] = useState(null);

    useEffect(() => {
        Promise.all([api.get("/auth/me"), api.get("/services")]).then(([m, s]) => {
            setMe(m.data);
            setAllServices(s.data || []);
            const mine = (s.data || []).filter((sv) => (m.data.services || []).includes(sv.id));
            setServices(mine);
        });
    }, []);

    if (!services || !me) return <Loader />;

    return (
        <div className="p-6 md:p-10">
            <PageHeader
                eyebrow="Engagements"
                title="Your services"
                subtitle="The work Rebild is currently delivering for your brand."
            />

            {services.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No services assigned yet"
                    description="Your Rebild account manager will assign services to you shortly."
                />
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((s) => {
                        const Icon = getIcon(s.icon);
                        return (
                            <div
                                key={s.id}
                                className="group border border-zinc-200 rounded-2xl p-6 hover:border-[#F77418] hover:shadow-lg transition-all"
                                data-testid={`service-card-${s.id}`}
                            >
                                <div className="w-12 h-12 rounded-md bg-[#0a0a0a] text-[#F77418] flex items-center justify-center mb-4 group-hover:scale-105 transition">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="font-display font-bold text-lg text-zinc-900">{s.name}</div>
                                <div className="text-sm text-zinc-500 mt-1.5">{s.description}</div>
                                <div className="mt-5 flex items-center gap-2 text-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="font-semibold text-emerald-700 uppercase tracking-wider">Active</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="mt-12 border-t border-zinc-100 pt-8">
                <h2 className="font-display font-bold text-xl text-zinc-900 mb-1">All Rebild services</h2>
                <p className="text-sm text-zinc-500 mb-5">Other things we can do for you. Talk to your account manager to add any of these.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {allServices
                        .filter((s) => !(me.services || []).includes(s.id))
                        .map((s) => {
                            const Icon = getIcon(s.icon);
                            return (
                                <div key={s.id} className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="font-semibold text-sm text-zinc-900">{s.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}
