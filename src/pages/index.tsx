import { Button } from "@/components/ui/button";
import Head from "next/head";
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

export default function Home() {
  return (
    <>
      <Head>
        <title>ConCarne</title>
        <meta name="description" content="Weight Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            ConCarne
          </h1>
          <div className="flex flex-col items-center gap-2">
            <WeightForm />
          </div>
        </div>
      </main>
    </>
  );
}

function WeightForm() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addWeightMutation = api.data.create.useMutation({
    onSuccess: () => {
      toast.success("Weight recorded successfully!");
      setWeight("");
      setIsSubmitting(false);
      setDialogOpen(false);
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
      date: Date.now(),
    });
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-white/10 hover:bg-white/20">
            Add New Weight
          </Button>
        </DialogTrigger>
        <DialogContent className="border-white/20 bg-[#2e026d]">
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
                className={`bg-white/5 text-white ${error ? "border-red-500" : ""}`}
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

// function AuthShowcase() {
//   const { data: sessionData } = useSession();
//
//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//       </p>
//       <div className="flex flex-col gap-4 sm:flex-row">
//         <Button
//           onClick={sessionData ? () => void signOut() : () => void signIn()}
//         >
//           {sessionData ? "Sign out" : "Sign in"}
//         </Button>
//         <Button asChild>
//           <Link href="/signup">Sign up</Link>
//         </Button>
//       </div>
//     </div>
//   );
// }
