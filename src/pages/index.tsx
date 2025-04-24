import { UserInfoCard } from "@/components/UserInfoCard";

export default function Home() {
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
