import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
// @ts-expect-error Next.js handles global CSS imports at build time.
import "./globals.css";

export const metadata: Metadata = {
  title: "VeeLion Frontend Assessment",
  description: "Task dashboard and activity feed modules",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <div className="page">{children}</div>
      </body>
    </html>
  );
}
