import { WeightForm } from "@/components/WeightForm";
import { UserInfoCard } from "@/components/UserInfoCard";
import { WeightChart } from "@/components/WeightChart";
import FastingTracker from "@/components/FastTracker";

export default function Home() {
  return (
    <>
      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        ConCarne
      </h1>

      <div className="flex w-full flex-col items-center gap-2">
        <WeightChart />
      </div>

      <div className="flex flex-col items-center gap-2">
        <WeightForm />
      </div>

      {/* User Information Card */}
      <UserInfoCard />

      <FastingTracker />
    </>
  );
}
