import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAuth } from "@/hooks/use-auth";
import { useMedicineList } from "@/hooks/use-medicine";
import { usePatientList } from "@/hooks/use-patient";
import { usePatientCheckupCreate } from "@/hooks/use-patient-checkup";
import { bloodTypeOptions } from "@/schemas/patient";
import {
  createPatientCheckupSchema,
  patientCheckupStatusOptions,
  type CreatePatientCheckupFormData,
} from "@/schemas/patient-checkup";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { PatientClinicalSummary } from "./patient-clinical-summary";
import type { Role } from "@/generated/rbac";

function toIsoFromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

function toSymptomArray(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function PatientCheckupFormDialog() {
  const [open, setOpen] = useState(false);
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const userRole: Role | string = user?.role || "user";
  const isDoctor = userRole === "doctor";

  const { createPatientCheckup, isCreating } = usePatientCheckupCreate();
  const { data: patients } = usePatientList({ page: 1, per_page: 100 });
  const { data: medicines } = useMedicineList({ page: 1, per_page: 100 });
  const [stockError, setStockError] = useState<string | null>(null);

  const form = useForm<CreatePatientCheckupFormData>({
    resolver: zodResolver(createPatientCheckupSchema),
    defaultValues: {
      patient_id: "",
      visit_date: "",
      chief_complaint: "",
      symptoms: "",
      status: "scheduled",
      diagnosis: "",
      temperature_c: undefined,
      blood_pressure: "",
      heart_rate: undefined,
      respiratory_rate: undefined,
      oxygen_saturation: undefined,
      height_cm: undefined,
      weight_kg: undefined,
      medicines: [],
      treatment_plan: "",
      doctor_name: isDoctor ? user?.full_name || "" : "",
      follow_up_date: "",
      notes: "",
      patient_allergies: "",
      patient_blood_type: undefined,
    },
  });

  const selectedPatientId = form.watch("patient_id");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  const onSubmit = (data: CreatePatientCheckupFormData) => {
    setStockError(null);

    if (isDoctor) {
      const currentStockByMedicine = new Map(
        medicines.map((m) => [m.id, m.current_stock ?? 0]),
      );
      const newQtyByMedicine = new Map<string, number>();

      for (const m of data.medicines ?? []) {
        newQtyByMedicine.set(
          m.medicine_id,
          (newQtyByMedicine.get(m.medicine_id) ?? 0) + m.quantity,
        );
      }

      for (const [medicineId, newQty] of newQtyByMedicine) {
        const currentStock = currentStockByMedicine.get(medicineId) ?? 0;
        if (newQty > currentStock) {
          const medicineName =
            medicines.find((m) => m.id === medicineId)?.name ?? medicineId;
          const message = `${medicineName}: stok tidak cukup. Maksimal ${currentStock}, diminta ${newQty}.`;
          setStockError(message);
          form.setError("medicines", { type: "manual", message });
          return;
        }
      }
    }

    createPatientCheckup({
      patient_id: data.patient_id,
      visit_date: toIsoFromDatetimeLocal(data.visit_date),
      chief_complaint: data.chief_complaint,
      symptoms: toSymptomArray(data.symptoms),
      notes: data.notes || null,
      status: data.status,
      diagnosis: data.diagnosis || null,
      temperature_c: data.temperature_c ?? null,
      blood_pressure: data.blood_pressure || null,
      heart_rate: data.heart_rate ?? null,
      respiratory_rate: data.respiratory_rate ?? null,
      oxygen_saturation: data.oxygen_saturation ?? null,
      height_cm: data.height_cm ?? null,
      weight_kg: data.weight_kg ?? null,
      medicines:
        data.medicines?.map((m) => ({
          medicine_id: m.medicine_id,
          medicine_name: m.medicine_name,
          quantity: m.quantity,
          dosage: m.dosage,
          frequency: m.frequency,
          duration_days: m.duration_days,
          notes: m.notes || null,
        })) || [],
      treatment_plan: data.treatment_plan || null,
      doctor_name: data.doctor_name || null,
      follow_up_date: data.follow_up_date || null,
      patient_allergies: data.patient_allergies || null,
      patient_blood_type: data.patient_blood_type || null,
    });

    setOpen(false);
    form.reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Patient Checkup
        </Button>
      </DialogTrigger>
      <DialogContent className="!w-[96vw] !max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Patient Checkup</DialogTitle>
          <DialogDescription>
            {isDoctor
              ? "Create new checkup and input complete patient assessment."
              : "Admin can create visit schedule and initial symptoms for doctor."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PatientClinicalSummary patientId={selectedPatientId} />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date *</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isDoctor ? (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patientCheckupStatusOptions.map((option) => (
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
              ) : (
                <FormItem>
                  <FormLabel>Medicine Reference</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      value={`${medicines.length} medicines available`}
                      readOnly
                    />
                  </FormControl>
                </FormItem>
              )}
            </div>

            <FormField
              control={form.control}
              name="chief_complaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chief Complaint *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Example: Demam sejak 2 hari"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms *</FormLabel>
                  <FormControl>
                    <Input placeholder="demam, batuk, pusing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isDoctor && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="temperature_c"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature (°C)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="blood_pressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Pressure</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="120/80"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="oxygen_saturation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SpO2</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patient_blood_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Type (Update Patient)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select blood type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bloodTypeOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                    name="patient_allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies (Update Patient)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="List any known allergies..."
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-3 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Medicines</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        append({
                          medicine_id: "",
                          medicine_name: "",
                          quantity: 1,
                          dosage: "",
                          frequency: "",
                          duration_days: 1,
                          notes: "",
                        })
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add Medicine
                    </Button>
                  </div>

                  {stockError ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                      {stockError}
                    </div>
                  ) : null}

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-12 gap-2 items-end"
                    >
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.medicine_id`}
                        render={({ field }) => (
                          <FormItem className="col-span-4">
                            <FormLabel>Medicine</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                const selected = medicines.find(
                                  (m) => m.id === value,
                                );
                                form.setValue(
                                  `medicines.${index}.medicine_name`,
                                  selected?.name || "",
                                );
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select medicine" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {medicines.map((medicine) => (
                                  <SelectItem
                                    key={medicine.id}
                                    value={medicine.id}
                                  >
                                    {medicine.name} (stock:{" "}
                                    {medicine.current_stock})
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
                        name={`medicines.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Dosage</FormLabel>
                            <FormControl>
                              <Input placeholder="500 mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.duration_days`}
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Days</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem className="col-span-6">
                            <FormLabel>Frequency</FormLabel>
                            <FormControl>
                              <Input placeholder="3x sehari" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.notes`}
                        render={({ field }) => (
                          <FormItem className="col-span-6">
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="After meal"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="doctor_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doctor Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="follow_up_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow Up Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="treatment_plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment Plan</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isDoctor
                          ? "Additional notes..."
                          : "Additional admin notes..."
                      }
                      {...field}
                      value={field.value ?? ""}
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
