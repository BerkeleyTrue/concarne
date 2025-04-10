import { Button } from "@/components/ui/button";
import Head from "next/head";
import { useState } from "react";
import { api } from "@/utils/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

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
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addWeightMutation = api.data.create.useMutation({
    onSuccess: () => {
      toast.success("Weight recorded successfully!");
      setWeight("");
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to record weight");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weight || isNaN(Number(weight))) {
      toast.error("Please enter a valid weight");
      return;
    }
    
    setIsSubmitting(true);
    addWeightMutation.mutate({
      weight: Number(weight),
      date: Date.now(),
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 rounded-lg bg-white/10 p-6 text-white">
      <h2 className="text-2xl font-bold">Track Your Weight</h2>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="weight" className="text-sm font-medium">
            Weight (pounds)
          </label>
          <Input
            id="weight"
            type="number"
            placeholder="Enter your weight in pounds"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="bg-white/5 text-white"
            min="1"
            step="0.1"
            required
          />
        </div>
        <Button 
          type="submit" 
          className="mt-2" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Recording..." : "Record Weight"}
        </Button>
      </form>
    </div>
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
