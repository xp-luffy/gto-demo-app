import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groundtruth | Property operations",
  description: "Tenant sales, GTO billing, and portfolio performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
