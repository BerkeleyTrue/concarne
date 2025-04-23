import Head from "next/head";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/NavBar";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Head>
        <title>ConCarne</title>
        <meta name="description" content="Weight Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-dvh bg-gradient-to-b from-[var(--ctp-base)] to-[var(--ctp-lavender)]">
        <NavBar />
        <main className="flex w-full flex-col items-center justify-center pb-16 md:pb-0 md:pl-16">
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </>
  );
};
