import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Rebild · Client Portal",
  description: "All-in-one client portal for Rebild Marketing — campaigns, creatives, invoices, reports and support.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
