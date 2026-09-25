import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Enterprise Challenge — Teach A Man To Fish",
  description:
    "The global platform where student teams plan, launch and run a real mini-enterprise. Mobile-first, multilingual, built for 60,000+ students in 60+ countries.",
};

export const viewport: Viewport = {
  themeColor: "#082018",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-paper font-sans text-ink antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
