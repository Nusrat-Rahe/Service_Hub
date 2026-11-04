import type { ReactNode } from "react";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import "./public.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-layout">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}