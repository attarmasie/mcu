import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Medicine } from "@/generated/models";
import { formatDateTime } from "@/lib/formatters";
import { Pill, Thermometer, FileText, BadgeCheck, Package } from "lucide-react";

interface MedicineDetailDialogProps {
  medicine: Medicine;
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

export function MedicineDetailDialog({
  medicine,
  open,
  onOpenChange,
}: MedicineDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{medicine.name}</DialogTitle>
              {medicine.code && (
                <p className="text-sm text-muted-foreground font-mono">
                  {medicine.code}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Badge
                variant={medicine.status === "active" ? "default" : "secondary"}
              >
                {medicine.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Medicine Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Medicine Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                icon={Pill}
                label="Dosage Form"
                value={medicine.dosage_form}
              />
              <DetailItem
                icon={Thermometer}
                label="Strength"
                value={medicine.strength || "-"}
              />
              <DetailItem icon={Package} label="Code" value={medicine.code} />
              <DetailItem
                icon={BadgeCheck}
                label="Prescription Required"
                value={medicine.is_prescription_required ? "Yes" : "No"}
              />
            </div>
            {medicine.notes && (
              <DetailItem
                icon={FileText}
                label="Notes"
                value={medicine.notes}
                className="col-span-2"
              />
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
                  {formatDateTime(medicine.created_at)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDateTime(medicine.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
