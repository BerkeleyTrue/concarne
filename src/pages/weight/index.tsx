import { WeightChart } from "@/components/WeightChart";
import { WeightForm } from "@/components/WeightForm";

export default function WeightPage() {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <WeightChart />

      <WeightForm />
    </div>
  );
}
