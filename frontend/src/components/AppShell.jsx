import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Home, Briefcase, Plus, Receipt, BellRing, FileText,
    LifeBuoy, User, Settings, Users, Layers, Megaphone, Ticket,
    LogOut, Menu, X, Search, BellDot,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import RebildLogo from "@/components/RebildLogo";
import api from "@/lib/api";

const CLIENT_NAV = [
    { to: "/client", label: "Dashboard", icon: Home, end: true },
    { to: "/client/services", label: "Services", icon: Briefcase },
    { to: "/client/addons", label: "Add-ons", icon: Plus },
    { to: "/client/invoices", label: "Invoices", icon: Receipt },
    { to: "/client/updates", label: "Updates", icon: BellRing },
    { to: "/client/reports", label: "Reports", icon: FileText },
    { to: "/client/support", label: "Support", icon: LifeBuoy },
    { to: "/client/profile", label: "Profile", icon: User },
];

const ADMIN_NAV = [
    { to: "/admin", label: "Dashboard", icon: Home, end: true },
    { to: "/admin/clients", label: "Clients", icon: Users },
    { to: "/admin/services", label: "Services", icon: Layers },
    { to: "/admin/invoices", label: "Invoices", icon: Receipt },
    { to: "/admin/updates", label: "Updates", icon: Megaphone },
    { to: "/admin/addons", label: "Add-ons", icon: Plus },
    { to: "/admin/tickets", label: "Tickets", icon: Ticket },
    { to: "/admin/settings", label: "Settings", icon: Settings },
];

function NavSection({ items, onNavigate }) {
    return (
        <nav className="flex-1 py-4 space-y-0.5">
            {items.map((it) => (
                <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    onClick={onNavigate}
                    data-testid={`nav-${it.label.toLowerCase().replace(/\s+/g, "-")}`}
                    className={({ isActive }) =>
                        `group flex items-center gap-3 px-5 py-2.5 text-sm font-medium border-l-2 transition-all ${
                            isActive
                                ? "border-[#F77418] bg-white/[0.04] text-white"
                                : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                        }`
                    }
                >
                    <it.icon className="w-4 h-4" strokeWidth={2} />
                    <span>{it.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}

function NotificationsBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    const load = async () => {
        try {
            const { data } = await api.get("/notifications");
            setItems(data || []);
        } catch (e) {
            //
        }
    };
    useEffect(() => {
        load();
        const t = setInterval(load, 20000);
        return () => clearInterval(t);
    }, []);

    const unread = items.filter((i) => !i.read).length;

    const handleClick = async (n) => {
        await api.post(`/notifications/${n.id}/read`).catch(() => {});
        setOpen(false);
        if (n.link) navigate(n.link);
        load();
    };

    const markAll = async () => {
        await api.post("/notifications/mark-all-read").catch(() => {});
        load();
    };

    return (
        <div className="relative">
            <button
                data-testid="topbar-notifications-button"
                onClick={() => setOpen((o) => !o)}
                className="relative w-9 h-9 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-200 flex items-center justify-center transition"
            >
                <BellDot className="w-4 h-4" />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F77418] text-[10px] font-bold text-black flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>
            {open && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setOpen(false)}
                    />
                    <div
                        data-testid="notifications-dropdown"
                        className="absolute right-0 mt-2 w-[340px] sm:w-[380px] bg-[#0c0c0d] border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <div className="text-sm font-semibold text-white">Notifications</div>
                            <button
                                onClick={markAll}
                                className="text-xs text-zinc-400 hover:text-[#F77418]"
                                data-testid="mark-all-read"
                            >
                                Mark all read
                            </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto scroll-dark">
                            {items.length === 0 ? (
                                <div className="px-4 py-10 text-center text-sm text-zinc-500">
                                    You're all caught up.
                                </div>
                            ) : (
                                items.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleClick(n)}
                                        className={`w-full text-left px-4 py-3 border-b border-white/[0.06] hover:bg-white/[0.03] flex gap-3 ${
                                            !n.read ? "bg-white/[0.02]" : ""
                                        }`}
                                    >
                                        <div className={`mt-1.5 w-2 h-2 rounded-full ${!n.read ? "bg-[#F77418]" : "bg-zinc-600"}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white truncate font-medium">{n.title}</div>
                                            <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{n.body}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function ProfileMenu({ user, onLogout }) {
    const [open, setOpen] = useState(false);
    const initials = (user?.name || user?.email || "U")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition"
                data-testid="topbar-profile-button"
            >
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#F77418] to-[#D85F0E] flex items-center justify-center text-xs font-bold text-black">
                    {initials}
                </div>
                <div className="hidden sm:block text-left">
                    <div className="text-xs font-medium text-white leading-tight">{user?.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 leading-tight">{user?.role}</div>
                </div>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-60 bg-[#0c0c0d] border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/10">
                            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                            <div className="text-xs text-zinc-500 truncate">{user?.email}</div>
                        </div>
                        <button
                            onClick={onLogout}
                            data-testid="logout-button"
                            className="w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/[0.05] flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function AppShell({ children, kind = "client" }) {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const nav = kind === "admin" ? ADMIN_NAV : CLIENT_NAV;
    const navigate = useNavigate();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar - desktop */}
            <aside className="hidden md:flex w-[252px] shrink-0 flex-col bg-[#0a0a0a] border-r border-white/[0.06] sticky top-0 h-screen">
                <div className="px-5 pt-6 pb-4 flex items-center justify-between">
                    <RebildLogo size="md" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 border border-white/10 px-1.5 py-0.5 rounded">
                        {kind === "admin" ? "Admin" : "Portal"}
                    </span>
                </div>
                <div className="px-5 pb-3">
                    <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                        {kind === "admin" ? "Agency Workspace" : "Client Workspace"}
                    </div>
                </div>
                <NavSection items={nav} />
                <div className="px-5 py-4 border-t border-white/[0.06] text-[10px] tracking-widest text-zinc-600 uppercase">
                    © Rebild Marketing
                </div>
            </aside>

            {/* Mobile sidebar drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative w-[280px] bg-[#0a0a0a] border-r border-white/10 flex flex-col h-full">
                        <div className="px-5 pt-6 pb-4 flex items-center justify-between">
                            <RebildLogo size="md" />
                            <button onClick={() => setMobileOpen(false)} className="text-zinc-400" data-testid="mobile-close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <NavSection items={nav} onNavigate={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main column */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-[#0a0a0a] border-b border-white/[0.06] flex items-center justify-between gap-4 px-4 sm:px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden w-9 h-9 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center"
                            onClick={() => setMobileOpen(true)}
                            data-testid="mobile-menu-button"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
                            <span className="text-zinc-600">/</span>
                            <span className="capitalize text-white font-medium">
                                {location.pathname.split("/").filter(Boolean).slice(-1)[0] || "Dashboard"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.04] border border-white/10 text-xs text-zinc-500 w-72">
                            <Search className="w-3.5 h-3.5" />
                            <span>Search…</span>
                            <kbd className="ml-auto text-[10px] font-mono text-zinc-600 border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
                        </div>
                        <NotificationsBell />
                        <ProfileMenu user={user} onLogout={handleLogout} />
                    </div>
                </header>

                {/* Content area - white card */}
                <main className="flex-1 bg-[#0a0a0a] p-0 sm:p-3 md:p-4">
                    <div className="bg-white text-zinc-900 min-h-[calc(100vh-64px-32px)] md:rounded-2xl shadow-sm overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
