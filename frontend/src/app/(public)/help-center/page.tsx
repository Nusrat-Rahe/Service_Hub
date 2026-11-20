import type { Metadata } from "next";
import HelpCenterPage from "./HelpCenterPage";

export const metadata: Metadata = {
  title: "Help Centre | ServiceHub",
  description: "Find answers to common questions or contact the ServiceHub support team.",
};

export default function HelpCenterRoute() {
  return <HelpCenterPage />;
}
