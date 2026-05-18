import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import "@/index.css";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import AppShell from "@/components/AppShell";
import Login from "@/pages/Login";

import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientServices from "@/pages/client/ClientServices";
import ClientAddons from "@/pages/client/ClientAddons";
import ClientInvoices from "@/pages/client/ClientInvoices";
import ClientUpdates from "@/pages/client/ClientUpdates";
import ClientSupport from "@/pages/client/ClientSupport";
import ClientProfile from "@/pages/client/ClientProfile";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClients from "@/pages/admin/AdminClients";
import AdminServices from "@/pages/admin/AdminServices";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import AdminUpdates from "@/pages/admin/AdminUpdates";
import AdminAddons from "@/pages/admin/AdminAddons";
import AdminTickets from "@/pages/admin/AdminTickets";
import AdminSettings from "@/pages/admin/AdminSettings";

function FullScreenLoader() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/10 border-t-[#F77418] rounded-full animate-spin" />
        </div>
    );
}

function RequireRole({ role, children }) {
    const { user } = useAuth();
    if (user === undefined) return <FullScreenLoader />;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== role) {
        return <Navigate to={user.role === "admin" ? "/admin" : "/client"} replace />;
    }
    return children;
}

function ClientLayout() {
    return (
        <RequireRole role="client">
            <AppShell kind="client">
                <Outlet />
            </AppShell>
        </RequireRole>
    );
}

function AdminLayout() {
    return (
        <RequireRole role="admin">
            <AppShell kind="admin">
                <Outlet />
            </AppShell>
        </RequireRole>
    );
}

function RootRedirect() {
    const { user } = useAuth();
    if (user === undefined) return <FullScreenLoader />;
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={user.role === "admin" ? "/admin" : "/client"} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<RootRedirect />} />

                    <Route path="/client" element={<ClientLayout />}>
                        <Route index element={<ClientDashboard />} />
                        <Route path="services" element={<ClientServices />} />
                        <Route path="addons" element={<ClientAddons />} />
                        <Route path="invoices" element={<ClientInvoices />} />
                        <Route path="updates" element={<ClientUpdates />} />
                        <Route path="reports" element={<ClientUpdates filterCategory="Report" />} />
                        <Route path="support" element={<ClientSupport />} />
                        <Route path="profile" element={<ClientProfile />} />
                    </Route>

                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="clients" element={<AdminClients />} />
                        <Route path="services" element={<AdminServices />} />
                        <Route path="invoices" element={<AdminInvoices />} />
                        <Route path="updates" element={<AdminUpdates />} />
                        <Route path="addons" element={<AdminAddons />} />
                        <Route path="tickets" element={<AdminTickets />} />
                        <Route path="settings" element={<AdminSettings />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
