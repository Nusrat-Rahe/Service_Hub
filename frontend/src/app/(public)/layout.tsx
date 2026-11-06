import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import "./public.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="public-layout">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </AuthProvider>
  );
}