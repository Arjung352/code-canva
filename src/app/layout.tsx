import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import NavbarWrapper from "@/components/layout/NavbarWrapper";

export const metadata: Metadata = {
  title: "Code Canvas",
  description: "Real-time collaborative coding platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Client-side navbar */}
          <NavbarWrapper />

          {/* Page content */}
          {children}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
