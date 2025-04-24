import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/NavBar";
import type { ReactNode } from "react";
import { Fira_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

const font = Fira_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concarne",
  description:
    "Weight Tracker - Track your weight and health progress with ease.",
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(font.className, "antialiased")}>
        <Providers>
          <div className="flex min-h-dvh bg-gradient-to-b from-[var(--ctp-base)] to-[var(--ctp-lavender)]">
            <NavBar />
            <main className="flex w-full flex-col items-center justify-center pb-16 md:pb-0 md:pl-16">
              <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
