import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  subsets: ["latin"],
});

const MyApp: AppType = ({
  Component,
  pageProps,
}) => {
  return (
    <>
      <div className={geist.className}>
        <Component {...pageProps} />
      </div>
      <Toaster />
    </>
  );
};

export default api.withTRPC(MyApp);
