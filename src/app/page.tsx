import { UserInfoCard } from "@/components/UserInfoCard";
import { api } from "@/lib/trpc/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const currentFast = await api.fast.getCurrentFast();
  if (currentFast) {
    return redirect("/fast");
  }
  return (
    <>
      <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
        ConCarne
      </h1>

      {/* User Information Card */}
      <UserInfoCard />
    </>
  );
}
