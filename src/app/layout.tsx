import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/NavBar";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

const font = localFont({
  src: [
    {
      path: "./fonts/FiraCode-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/FiraCode-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/FiraCode-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
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
          <div className="flex w-dvw h-dvh bg-gradient-to-b from-[var(--ctp-base)] to-[var(--ctp-lavender)]">
            <NavBar />
            <main
              className={cn(
                "flex flex-col items-center justify-center",
                "w-full md:w-[calc(100%-calc(var(--spacing)*24))]",
                "pb-16 md:m-2 md:pb-0",
                "bg-[var(--ctp-surface1)] md:rounded-xl md:shadow",
              )}
            >
              <div className="container flex flex-col items-center justify-center gap-12 px-2 md:px-4 py-16">
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
