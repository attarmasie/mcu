import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { EmailLink } from "@/components/common/email-link";
import type { User } from "@/generated/models";
import { formatDateTime } from "@/lib/formatters";
import { Mail, Shield, User as UserIcon } from "lucide-react";

interface UserDetailDialogProps {
  user: User;
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

function getRoleBadgeVariant(
  role: string | undefined
): "default" | "secondary" | "outline" {
  switch (role) {
    case "admin":
      return "default";
    case "doctor":
      return "secondary";
    default:
      return "outline";
  }
}

function formatRole(role: string | undefined): string {
  if (!role) return "-";
  const roleMap: Record<string, string> = {
    admin: "Admin",
    doctor: "Doctor",
    operator: "Operator",
  };
  return roleMap[role] || role;
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">{user.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {formatRole(user.role)}
              </Badge>
              <Badge variant={user.is_active ? "default" : "secondary"}>
                {user.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              User Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <DetailItem
                icon={UserIcon}
                label="Full Name"
                value={user.name}
              />
              <DetailItem
                icon={Mail}
                label="Email"
                value={<EmailLink email={user.email} />}
              />
              <DetailItem
                icon={Shield}
                label="Role"
                value={formatRole(user.role)}
              />
            </div>
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
                  {formatDateTime(user.created_at)}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDateTime(user.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
