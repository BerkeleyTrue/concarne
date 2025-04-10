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
import { Pencil } from "lucide-react";

function HeightForm({ userId, currentHeight }: { userId: string; currentHeight?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feet, setFeet] = useState(currentHeight ? Math.floor(currentHeight / 12).toString() : "5");
  const [inches, setInches] = useState(currentHeight ? (currentHeight % 12).toString() : "0");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const utils = api.useContext();
  
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
    if (totalInches < 24) { // Minimum height of 2 feet
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

    const totalInches = (Number(feet) * 12) + Number(inches);
    
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
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
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

export default function Home() {
  const { data: userData, isLoading: isUserLoading } =
    api.auth.getUser.useQuery({
      userId: "1",
    });
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

          {/* User Information Card */}
          <div className="w-full max-w-md rounded-lg border border-white/20 bg-white/5 p-6 text-white shadow-md">
            <h2 className="mb-4 text-2xl font-bold">User Profile</h2>
            {isUserLoading ? (
              <p>Loading user information...</p>
            ) : userData ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Name:</span>
                  <span className="font-medium">
                    {userData.username ?? "Not provided"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Height:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {userData.height 
                        ? `${Math.floor(userData.height / 12)}' ${userData.height % 12}"`
                        : "Not provided"}
                    </span>
                    <HeightForm userId={userData.id} currentHeight={userData.height ?? undefined} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">User ID:</span>
                  <span className="font-medium">{userData.id}</span>
                </div>
              </div>
            ) : (
              <p>No user information available</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <WeightForm />
          </div>
        </div>
      </main>
    </>
  );
}

function WeightForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addWeightMutation = api.data.create.useMutation({
    onSuccess: () => {
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
      date: Date.now(),
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
