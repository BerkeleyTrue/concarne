// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import {
  Dialog,
  // DialogContent,
  // DialogHeader,
  // DialogTitle,
  // DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/trpc/client";

export const UpdateStart = ({
  // fastId,
  isOpen,
  onClose,
  onUpdated,
}: {
  fastId: number;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  api.fast.updateStartTime.useMutation({
    onSuccess: () => {
      // Refetch the current fast after updating
      onUpdated();
    },
    onError: (error) => {
      console.error("Error updating fast start time:", error);
      toast.error("Failed to update fast start time. Please try again.");
    },
  });

  return <Dialog open={isOpen} onOpenChange={onClose}></Dialog>;
};
