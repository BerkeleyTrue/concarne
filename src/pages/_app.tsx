import { type AppType } from "next/app";
import { Fira_Mono } from "next/font/google";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import { Layout } from "@/components/Layout";

const font = Fira_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={font.className}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
};

export default api.withTRPC(MyApp);
