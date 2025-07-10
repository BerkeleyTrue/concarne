import { Button } from "@/components/ui/button";
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
  endTime: z.date().refine((date) => date <= new Date(), {
    message: "End time cannot be in the future",
  }),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export const UpdateEnd = ({
  fastId,
  isOpen,
  initialEndTime,
  onClose,
  onUpdated,
}: {
  fastId: number;
  isOpen: boolean;
  initialEndTime: Date;
  onClose: () => void;
  onUpdated: (newEndTime: Date) => void;
}) => {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      endTime: initialEndTime,
    },
  });

  const mutate = api.fast.updateEndTime.useMutation({
    onSuccess: () => {
      console.log("Fast end time updated successfully");
      const newEndTime = form.getValues().endTime;
      onUpdated(newEndTime);
    },
    onError: (error) => {
      console.error("Error updating fast end time:", error);
      toast.error("Failed to update fast end time. Please try again.");
    },
  });

  const handleSubmit = useCallback(
    (values: FormSchemaType) => {
      const now = new Date();
      if (values.endTime > now) {
        toast.error("End time cannot be in the future");
        return;
      }
      
      console.log("Submitting form with values:", values);
      mutate.mutate({
        fastId,
        endTime: values.endTime.toISOString(),
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
              <DialogTitle>Update Fast End Date & Time</DialogTitle>
              <DialogDescription>
                Update the end date and time of this fast. End time cannot be after current time.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              newDate.setHours(field.value?.getHours() ?? 0);
                              newDate.setMinutes(field.value?.getMinutes() ?? 0);
                              newDate.setSeconds(field.value?.getSeconds() ?? 0);
                              field.onChange(newDate);
                            }
                          }}
                          className="rounded-md border"
                          disabled={(date) => date > new Date()}
                        />
                        <div className="flex justify-center">
                          <TimePicker
                            onChange={(time) => {
                              if (time) {
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
                variant="outline"
                className="btn"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button
                className="btn"
                variant="default"
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