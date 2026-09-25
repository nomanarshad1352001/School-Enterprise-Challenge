"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/shell";

/* All /app routes render inside the authenticated shell. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
