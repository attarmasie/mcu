import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { PatientCheckup } from "@/generated/models";
import { formatDate, formatDateTime } from "@/lib/formatters";

interface PatientCheckupDetailDialogProps {
  checkup: PatientCheckup & { patient_name?: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function statusVariant(
  status?: string,
): "default" | "secondary" | "destructive" {
  if (status === "completed") return "default";
  if (status === "cancelled") return "destructive";
  return "secondary";
}

export function PatientCheckupDetailDialog({
  checkup,
  open,
  onOpenChange,
}: PatientCheckupDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Checkup Detail</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{checkup.chief_complaint}</div>
              <div className="text-muted-foreground">
                Visit: {formatDateTime(checkup.visit_date)}
              </div>
            </div>
            <Badge variant={statusVariant(checkup.status)}>
              {checkup.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-muted-foreground">Patient</div>
              <div>{checkup.patient_name || checkup.patient_id}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Doctor</div>
              <div>{checkup.doctor_name || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Symptoms</div>
              <div>{checkup.symptoms?.join(", ") || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Diagnosis</div>
              <div>{checkup.diagnosis || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Temperature</div>
              <div>
                {checkup.temperature_c ? `${checkup.temperature_c} °C` : "-"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Blood Pressure</div>
              <div>{checkup.blood_pressure || "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Heart Rate</div>
              <div>{checkup.heart_rate ?? "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">SpO2</div>
              <div>{checkup.oxygen_saturation ?? "-"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Follow Up</div>
              <div>{formatDate(checkup.follow_up_date)}</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="font-medium">Prescribed Medicines</div>
            {!checkup.medicines?.length ? (
              <div className="text-muted-foreground">
                No medicines recorded.
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Medicine</th>
                      <th className="text-left p-2">Qty</th>
                      <th className="text-left p-2">Dosage</th>
                      <th className="text-left p-2">Frequency</th>
                      <th className="text-left p-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkup.medicines.map((item, idx) => (
                      <tr
                        key={`${item.medicine_id}-${idx}`}
                        className="border-t"
                      >
                        <td className="p-2">{item.medicine_name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{item.dosage}</td>
                        <td className="p-2">{item.frequency}</td>
                        <td className="p-2">{item.duration_days} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
