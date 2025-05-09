"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/trpc/client";
import { startOfDay } from "date-fns";

export function WeightForm() {
  const { data: lastWeight } = api.data.getLatest.useQuery();
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState<string>(lastWeight?.weight.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!weight && lastWeight) {
      setWeight(lastWeight.weight.toString());
    }
  }, [lastWeight, weight]);

  const utils = api.useUtils();

  const addWeightMutation = api.data.create.useMutation({
    onSuccess: () => {
      // Invalidate the getAll query to refresh the chart data
      void utils.data.getAll.invalidate();
      toast.success("Weight recorded successfully!");
      setWeight("");
      setIsSubmitting(false);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to record weight");
      setIsSubmitting(false);
    },
  });

  const validateWeight = (value: string): boolean => {
    if (!value) {
      setError("Weight is required");
      return false;
    }

    const weightNum = Number(value);
    if (isNaN(weightNum)) {
      setError("Weight must be a number");
      return false;
    }

    if (weightNum <= 0) {
      setError("Weight must be greater than 0");
      return false;
    }

    if (weightNum > 1500) {
      setError("Weight seems too high");
      return false;
    }

    setError(null);
    return true;
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeight(value);
    validateWeight(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateWeight(weight)) {
      return;
    }

    setIsSubmitting(true);
    addWeightMutation.mutate({
      weight: Number(weight),
      date: startOfDay(new Date()),
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="">Add New Weight</Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-[var(--ctp-text)]">
          <DialogHeader>
            <DialogTitle className="text-white">Add Weight Entry</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-4 text-white"
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="weight" className="text-sm font-medium">
                Weight (pounds)
              </label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter your weight in pounds"
                value={weight}
                onChange={handleWeightChange}
                className={`bg-[var(--ctp-text)]/5 text-white ${error ? "border-red-500" : ""}`}
                min="10"
                step="0.1"
                required
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? "weight-error" : undefined}
              />
              {error && (
                <p id="weight-error" className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" className="mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Weight"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
