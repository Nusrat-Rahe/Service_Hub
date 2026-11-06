"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthenticatedUserLayout>{children}</AuthenticatedUserLayout>
    </AuthProvider>
  );
}

function AuthenticatedUserLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();

  useEffect(() => {
    if (!isLoadingUser && !user) router.replace("/");
  }, [isLoadingUser, router, user]);

  if (isLoadingUser || !user) {
    return (
      <main className="dashboard-session-check" aria-live="polite">
        <span className="dashboard-session-spinner" aria-hidden="true" />
        <p>Checking your account...</p>
      </main>
    );
  }

  return <>{children}</>;
}