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
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { useCallback } from "react";
import { TimePicker } from "../ui/datetime";
import { Calendar } from "../ui/calendar";

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
              <DialogTitle>Update Fast Start Date & Time</DialogTitle>
              <DialogDescription>
                Update the start date and time of this fast.
              </DialogDescription>
            </DialogHeader>

            <div className="mb-4 space-y-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // Preserve the existing time when date changes
                              const newDate = new Date(date);
                              newDate.setHours(field.value?.getHours() ?? 0);
                              newDate.setMinutes(field.value?.getMinutes() ?? 0);
                              newDate.setSeconds(field.value?.getSeconds() ?? 0);
                              field.onChange(newDate);
                            }
                          }}
                          className="rounded-md border"
                        />
                        <div className="flex justify-center">
                          <TimePicker
                            onChange={(time) => {
                              if (time) {
                                // Preserve the selected date when time changes
                                const newDate = new Date(field.value ?? new Date());
                                newDate.setHours(time.getHours());
                                newDate.setMinutes(time.getMinutes());
                                newDate.setSeconds(time.getSeconds());
                                field.onChange(newDate);
                              }
                            }}
                            date={field.value}
                            granularity="minute"
                          />
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
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
