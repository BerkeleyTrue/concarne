import FastingTracker from "@/components/FastTracker";
import { api } from "@/lib/trpc/server";

export default async function FastingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const fastId = resolvedSearchParams.id ? parseInt(resolvedSearchParams.id, 10) : undefined;
  const currentFast = fastId 
    ? await api.fast.getCurrentFast({ id: fastId })
    : await api.fast.getCurrentFast();

  return (
    <div className="flex flex-col items-center gap-2">
      <FastingTracker initFast={currentFast} fastId={fastId} />
    </div>
  );
}
