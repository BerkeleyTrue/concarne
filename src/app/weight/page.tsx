import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WeightChart } from "@/components/WeightChart";
import { WeightForm } from "@/components/WeightForm";

export default function WeightPage() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <WeightChart />

      <WeightForm />
      <Button asChild={true} variant="destructive">
        <Link href="/weight/backup">Backup</Link>
      </Button>
    </div>
  );
}
