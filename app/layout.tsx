import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World-Kernel Platform",
  description: "A collaborative platform for world-building and creative writing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
