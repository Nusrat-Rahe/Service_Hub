import type { ReactNode } from "react";
import SiteHeader from "@/components/layout/SiteHeader";

export default function UserBookingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
