import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { EmailLink } from "@/components/common/email-link";
import { PhoneLink } from "@/components/common/phone-link";
import type { Patient } from "@/generated/models";
import {
  formatDate,
  formatDateTime,
  formatGender,
  formatPatientType,
} from "@/lib/formatters";
import {
  Calendar,
  Droplet,
  Mail,
  MapPin,
  Phone,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface PatientDetailDialogProps {
  patient: Patient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (!value) return null;

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function getPatientTypeBadgeVariant(
  type: string | undefined
): "default" | "secondary" | "outline" {
  switch (type) {
    case "teacher":
      return "default";
    case "student":
      return "secondary";
    default:
      return "outline";
  }
}

function getGenderBadgeVariant(
  gender: string | undefined
): "default" | "secondary" | "outline" {
  switch (gender) {
    case "male":
      return "default";
    case "female":
      return "secondary";
    default:
      return "outline";
  }
}

export function PatientDetailDialog({
  patient,
  open,
  onOpenChange,
}: PatientDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{patient.full_name}</DialogTitle>
              {patient.medical_record_number && (
                <p className="text-sm text-muted-foreground font-mono">
                  {patient.medical_record_number}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge variant={getGenderBadgeVariant(patient.gender)}>
                {formatGender(patient.gender)}
              </Badge>
              <Badge variant={getPatientTypeBadgeVariant(patient.patient_type)}>
                {formatPatientType(patient.patient_type)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                icon={Calendar}
                label="Date of Birth"
                value={formatDate(patient.date_of_birth)}
              />
              <DetailItem
                icon={Droplet}
                label="Blood Type"
                value={patient.blood_type || "-"}
              />
              <DetailItem
                icon={Phone}
                label="Phone Number"
                value={
                  patient.phone_number ? (
                    <PhoneLink phone={patient.phone_number} />
                  ) : (
                    "-"
                  )
                }
              />
              <DetailItem
                icon={Mail}
                label="Email"
                value={
                  patient.email ? <EmailLink email={patient.email} /> : "-"
                }
              />
            </div>
            {patient.address && (
              <DetailItem
                icon={MapPin}
                label="Address"
                value={patient.address}
                className="col-span-2"
              />
            )}
          </div>

          <Separator />

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Medical Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                icon={FileText}
                label="Medical Record Number"
                value={patient.medical_record_number || "-"}
              />
              <DetailItem
                icon={Droplet}
                label="Blood Type"
                value={patient.blood_type || "-"}
              />
            </div>
            {patient.allergies && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      Allergies
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {patient.allergies}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Emergency Contact
            </h3>
            {patient.emergency_contact_name || patient.emergency_contact_phone ? (
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  icon={Users}
                  label="Contact Name"
                  value={patient.emergency_contact_name || "-"}
                />
                <DetailItem
                  icon={Phone}
                  label="Contact Phone"
                  value={
                    patient.emergency_contact_phone ? (
                      <PhoneLink phone={patient.emergency_contact_phone} />
                    ) : (
                      "-"
                    )
                  }
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No emergency contact information provided
              </p>
            )}
          </div>

          <Separator />

          {/* Record Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Record Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-medium">
                  {formatDateTime(patient.created_at)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDateTime(patient.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
