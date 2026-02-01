import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Medicine } from "@/generated/models";
import { useMedicineUpdate } from "@/hooks/use-medicine";
import {
  createMedicineSchema,
  type CreateMedicineFormData,
  dosageFormOptions,
} from "@/schemas/medicine";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

interface MedicineEditDialogProps {
  medicine: Medicine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MedicineEditDialog({
  medicine,
  open,
  onOpenChange,
}: MedicineEditDialogProps) {
  const { updateMedicine, isUpdating } = useMedicineUpdate();

  const form = useForm<CreateMedicineFormData>({
    resolver: zodResolver(createMedicineSchema),
    defaultValues: {
      name: "",
      dosage_form: "tablet",
      strength: "",
      is_prescription_required: false,
      notes: "",
    },
  });

  useEffect(() => {
    if (open && medicine) {
      form.reset({
        name: medicine.name,
        dosage_form:
          medicine.dosage_form as CreateMedicineFormData["dosage_form"],
        strength: medicine.strength ?? "",
        is_prescription_required: medicine.is_prescription_required,
        notes: medicine.notes ?? "",
      });
    }
  }, [open, medicine, form]);

  const onSubmit = (data: CreateMedicineFormData) => {
    if (medicine.id) {
      updateMedicine(medicine.id, data);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
          <DialogDescription>
            Update the medicine information below. Fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Paracetamol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="MED12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosage_form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage Form *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dosage form" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dosageFormOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strength</FormLabel>
                    <FormControl>
                      <Input placeholder="500 mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_prescription_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-2">
                    <FormLabel>Prescription Required?</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any relevant notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
