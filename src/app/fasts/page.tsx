import { FastsHistory } from "@/components/FastsHistory";
import { api } from "@/lib/trpc/server";

export default async function FastsPage() {
  const fasts = await api.fast.getAllFasts();

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <h1 className="text-3xl font-bold">Fasting History</h1>
      <FastsHistory initFasts={fasts} />
    </div>
  );
}