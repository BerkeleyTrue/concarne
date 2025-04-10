import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

export function HeightForm({
  userId,
  currentHeight,
}: {
  userId: string;
  currentHeight?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [feet, setFeet] = useState(
    currentHeight ? Math.floor(currentHeight / 12).toString() : "5",
  );
  const [inches, setInches] = useState(
    currentHeight ? (currentHeight % 12).toString() : "0",
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();

  const updateHeightMutation = api.auth.updateUserHeight.useMutation({
    onSuccess: () => {
      toast.success("Height updated successfully!");
      setIsSubmitting(false);
      setIsOpen(false);
      void utils.auth.getUser.invalidate({ userId });
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to update height");
      setIsSubmitting(false);
    },
  });

  const validateHeight = (): boolean => {
    if (!feet || !inches) {
      setError("Both feet and inches are required");
      return false;
    }

    const feetNum = Number(feet);
    const inchesNum = Number(inches);

    if (isNaN(feetNum) || isNaN(inchesNum)) {
      setError("Height must be a number");
      return false;
    }

    if (feetNum < 0 || inchesNum < 0) {
      setError("Height values must be positive");
      return false;
    }

    if (inchesNum >= 12) {
      setError("Inches must be less than 12");
      return false;
    }

    if (feetNum > 8) {
      setError("Height seems too high");
      return false;
    }

    const totalInches = feetNum * 12 + inchesNum;
    if (totalInches < 24) {
      // Minimum height of 2 feet
      setError("Height must be at least 2 feet");
      return false;
    }

    setError(null);
    return true;
  };

  const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeet(e.target.value);
  };

  const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInches(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateHeight()) {
      return;
    }

    const totalInches = Number(feet) * 12 + Number(inches);

    setIsSubmitting(true);
    updateHeightMutation.mutate({
      userId,
      height: totalInches,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full p-0"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent className="border-white/20 bg-[#2e026d]">
          <DialogHeader>
            <DialogTitle className="text-white">Update Height</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-4 text-white"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">
                Height (feet and inches)
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="feet"
                    type="number"
                    placeholder="Feet"
                    value={feet}
                    onChange={handleFeetChange}
                    className={`bg-white/5 text-white ${error ? "border-red-500" : ""}`}
                    min="0"
                    max="8"
                    step="1"
                    required
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "height-error" : undefined}
                  />
                  <span className="ml-1 text-xs">ft</span>
                </div>
                <div className="flex-1">
                  <Input
                    id="inches"
                    type="number"
                    placeholder="Inches"
                    value={inches}
                    onChange={handleInchesChange}
                    className={`bg-white/5 text-white ${error ? "border-red-500" : ""}`}
                    min="0"
                    max="11"
                    step="1"
                    required
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? "height-error" : undefined}
                  />
                  <span className="ml-1 text-xs">in</span>
                </div>
              </div>
              {error && (
                <p id="height-error" className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
            <Button type="submit" className="mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Height"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
