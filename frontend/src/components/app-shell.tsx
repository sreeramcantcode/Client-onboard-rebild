"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  Briefcase,
  Plus,
  Receipt,
  BellRing,
  FileText,
  LifeBuoy,
  User as UserIcon,
  Settings,
  Users,
  Layers,
  Megaphone,
  Ticket,
  LogOut,
  Menu,
  X,
  Search,
  BellDot,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import RebildLogo from "@/components/rebild-logo";
import api from "@/lib/api";
import { PORTAL_BASE } from "@/lib/constants";
import { cn } from "@/lib/utils";



interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const CLIENT_NAV: NavItem[] = [
  { href: `${PORTAL_BASE}/client`, label: "Dashboard", icon: Home, exact: true },
  { href: `${PORTAL_BASE}/client/services`, label: "Services", icon: Briefcase },
  { href: `${PORTAL_BASE}/client/addons`, label: "Add-ons", icon: Plus },
  { href: `${PORTAL_BASE}/client/invoices`, label: "Invoices", icon: Receipt },
  { href: `${PORTAL_BASE}/client/updates`, label: "Updates", icon: BellRing },
  { href: `${PORTAL_BASE}/client/reports`, label: "Reports", icon: FileText },
  { href: `${PORTAL_BASE}/client/support`, label: "Support", icon: LifeBuoy },
  { href: `${PORTAL_BASE}/client/profile`, label: "Profile", icon: UserIcon },
];

const ADMIN_NAV: NavItem[] = [
  { href: `${PORTAL_BASE}/admin`, label: "Dashboard", icon: Home, exact: true },
  { href: `${PORTAL_BASE}/admin/clients`, label: "Clients", icon: Users },
  { href: `${PORTAL_BASE}/admin/services`, label: "Services", icon: Layers },
  { href: `${PORTAL_BASE}/admin/invoices`, label: "Invoices", icon: Receipt },
  { href: `${PORTAL_BASE}/admin/updates`, label: "Updates", icon: Megaphone },
  { href: `${PORTAL_BASE}/admin/addons`, label: "Add-ons", icon: Plus },
  { href: `${PORTAL_BASE}/admin/tickets`, label: "Tickets", icon: Ticket },
  { href: `${PORTAL_BASE}/admin/settings`, label: "Settings", icon: Settings },
];

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  link?: string;
  created_at: string;
}

function NavSection({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-4 space-y-0.5">
      {items.map((it) => {
        const Icon = it.icon;
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={onNavigate}
            data-testid={`nav-${it.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={cn(
              "group flex items-center gap-3 px-5 py-2.5 text-sm font-medium border-l-2 transition-all",
              active
                ? "border-[#F77418] bg-white/[0.04] text-white"
                : "border-transparent text-zinc-400 hover:text-white hover:bg-white/[0.03]"
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const router = useRouter();

  const load = async () => {
    try {
      const { data } = await api.get<Notification[]>("/notifications");
      setItems(data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  const unread = items.filter((i) => !i.read).length;

  const handleClick = async (n: Notification) => {
    await api.post(`/notifications/${n.id}/read`).catch(() => {});
    setOpen(false);
    if (n.link) router.push(`${PORTAL_BASE}${n.link}`);
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
        aria-label="Notifications"
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
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
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
                  You&apos;re all caught up.
                </div>
              ) : (
                items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-white/[0.06] hover:bg-white/[0.03] flex gap-3",
                      !n.read && "bg-white/[0.02]"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-1.5 w-2 h-2 rounded-full",
                        !n.read ? "bg-[#F77418]" : "bg-zinc-600"
                      )}
                    />
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

function ProfileMenu({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const initials = (user.name || user.email || "U")
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
          <div className="text-xs font-medium text-white leading-tight">{user.name}</div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500 leading-tight">
            {user.role}
          </div>
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-60 bg-[#0c0c0d] border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <div className="text-xs text-zinc-500 truncate">{user.email}</div>
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

export default function AppShell({
  children,
  kind = "client",
}: {
  children: React.ReactNode;
  kind?: "client" | "admin";
}) {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const nav = kind === "admin" ? ADMIN_NAV : CLIENT_NAV;

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push(`${PORTAL_BASE}/login`);
  };

  const crumb = pathname.split("/").filter(Boolean).slice(-1)[0] || "Dashboard";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
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

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-[280px] bg-[#0a0a0a] border-r border-white/10 flex flex-col h-full">
            <div className="px-5 pt-6 pb-4 flex items-center justify-between">
              <RebildLogo size="md" />
              <button
                onClick={() => setMobileOpen(false)}
                className="text-zinc-400"
                data-testid="mobile-close"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavSection items={nav} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#0a0a0a] border-b border-white/[0.06] flex items-center justify-between gap-4 px-4 sm:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center"
              onClick={() => setMobileOpen(true)}
              data-testid="mobile-menu-button"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
              <span className="text-zinc-600">/</span>
              <span className="capitalize text-white font-medium">{crumb}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-md bg-white/[0.04] border border-white/10 text-xs text-zinc-500 w-72">
              <Search className="w-3.5 h-3.5" />
              <span>Search…</span>
              <kbd className="ml-auto text-[10px] font-mono text-zinc-600 border border-white/10 rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
            </div>
            <NotificationsBell />
            <ProfileMenu onLogout={handleLogout} />
          </div>
        </header>

        <main className="flex-1 bg-[#0a0a0a] p-0 sm:p-3 md:p-4">
          <div className="portal-dark bg-[#0a0a0a] text-white min-h-[calc(100vh-64px-32px)] md:rounded-2xl shadow-sm overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
