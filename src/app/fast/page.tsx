import FastingTracker from "@/components/FastTracker";
import { api } from "@/lib/trpc/server";

export default async function FastingPage() {
  const currentFast = await api.fast.getCurrentFast();

  return (
    <div className="flex flex-col items-center gap-2">
      <FastingTracker initFast={currentFast}/>
    </div>
  );
}
