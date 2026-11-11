"use client";

import { useEffect, type ReactNode } from "react";
import { House } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import AdminShell from "./AdminShell";
import "./admin.css";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoadingUser && !isLoginPage && user?.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [isLoadingUser, isLoginPage, router, user]);

  if (isLoginPage) return <>{children}</>;
  if (isLoadingUser || user?.role !== "admin") {
    return <main className="admin-loading"><span className="admin-loading-mark"><House aria-hidden="true" size={23} /></span><span>Loading your workspace…</span></main>;
  }
  return <AdminShell>{children}</AdminShell>;
}