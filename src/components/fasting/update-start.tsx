import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/trpc/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "../ui/form";
import { useCallback } from "react";
import { TimePicker } from "../ui/datetime";

const FormSchema = z.object({
  startTime: z.date(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export const UpdateStart = ({
  fastId,
  isOpen,
  initialStartTime,
  onClose,
  onUpdated,
}: {
  fastId: number;
  isOpen: boolean;
  initialStartTime: Date;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      startTime: initialStartTime,
    },
  });

  const mutate = api.fast.updateStartTime.useMutation({
    onSuccess: () => {
      // Refetch the current fast after updating
      console.log("Fast start time updated successfully");
      onUpdated();
    },
    onError: (error) => {
      console.error("Error updating fast start time:", error);
      toast.error("Failed to update fast start time. Please try again.");
    },
  });

  const handleSubmit = useCallback(
    (values: FormSchemaType) => {
      console.log("Submitting form with values:", values);
      mutate.mutate({
        fastId,
        startTime: values.startTime.toISOString(),
      });
    },
    [fastId, mutate],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex w-full flex-col items-center justify-center"
          >
            <DialogHeader>
              <DialogTitle>Update Fast Start Time</DialogTitle>
              <DialogDescription>
                Are you sure you want to update the start time of this fast?
                This will change the start time to the current time.
              </DialogDescription>
            </DialogHeader>

            <div className="mb-4 flex justify-center space-y-4">
              <TimePicker
                onChange={(date) =>
                  date &&
                  form.setValue("startTime", date, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                date={form.getValues("startTime")}
                granularity="minute"
              />
            </div>

            <div className="flex justify-between space-x-2">
              <Button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                className="btn btn-primary"
                type="submit"
                disabled={mutate.isPending}
              >
                Update
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
