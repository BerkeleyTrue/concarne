import Head from "next/head";
import { WeightForm } from "@/components/WeightForm";
import { UserInfoCard } from "@/components/UserInfoCard";
import { WeightChart } from "@/components/WeightChart";

export default function Home() {
  return (
    <>
      <Head>
        <title>ConCarne</title>
        <meta name="description" content="Weight Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            ConCarne
          </h1>

          <div className="flex flex-col items-center gap-2 w-full">
            <WeightChart />
          </div>

          <div className="flex flex-col items-center gap-2">
            <WeightForm />
          </div>

          {/* User Information Card */}
          <UserInfoCard />
        </div>
      </main>
    </>
  );
}
