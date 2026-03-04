import { useGetDashboardStats } from "@/generated/dashboard/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Pill,
  Stethoscope,
  AlertTriangle,
  Clock,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">
          {title}
        </CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "completed"
      ? "default"
      : status === "scheduled"
        ? "secondary"
        : "destructive";
  return <Badge variant={variant}>{status}</Badge>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

export function DashboardPage() {
  const { data, isLoading } = useGetDashboardStats();
  const stats = data?.data;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pasien"
          value={stats?.total_patients ?? 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Obat Aktif"
          value={stats?.total_medicines ?? 0}
          icon={Pill}
          isLoading={isLoading}
        />
        <StatCard
          title="Pemeriksaan Hari Ini"
          value={stats?.total_checkups_today ?? 0}
          icon={Stethoscope}
          isLoading={isLoading}
        />
      </div>

      {/* Checkup Status: Hari Ini & Minggu Ini */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Hari Ini */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pemeriksaan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Dijadwalkan</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.checkup_status_today?.scheduled ?? 0}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Selesai</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.checkup_status_today?.completed ?? 0}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Dibatalkan</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    {stats?.checkup_status_today?.cancelled ?? 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minggu Ini */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pemeriksaan Minggu Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Dijadwalkan</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-blue-600">
                    {stats?.checkup_status_week?.scheduled ?? 0}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Selesai</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">
                    {stats?.checkup_status_week?.completed ?? 0}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Dibatalkan</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold text-red-600">
                    {stats?.checkup_status_week?.cancelled ?? 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Checkups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-4" />
              Pemeriksaan Terakhir
            </CardTitle>
            <CardDescription>5 pemeriksaan terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pasien</TableHead>
                    <TableHead>Keluhan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recent_checkups?.length ? (
                    stats.recent_checkups.map((checkup) => (
                      <TableRow key={checkup.id}>
                        <TableCell className="font-medium">
                          {checkup.patient_name}
                        </TableCell>
                        <TableCell className="max-w-37.5 truncate">
                          {checkup.chief_complaint}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={checkup.status} />
                        </TableCell>
                        <TableCell>
                          {formatDate(checkup.visit_date)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        Belum ada data pemeriksaan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Patient Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" />
              Distribusi Tipe Pasien
            </CardTitle>
            <CardDescription>
              Jumlah pasien berdasarkan tipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.patient_type_summary?.map((pt) => {
                  const total = stats.total_patients || 1;
                  const pct = Math.round((pt.count / total) * 100);
                  const label =
                    pt.patient_type === "teacher"
                      ? "Guru"
                      : pt.patient_type === "student"
                        ? "Siswa"
                        : "Umum";
                  return (
                    <div key={pt.patient_type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{label}</span>
                        <span className="text-muted-foreground">
                          {pt.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!stats?.patient_type_summary?.length && (
                  <p className="text-center text-sm text-muted-foreground">
                    Belum ada data pasien
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock & Expiring Batches */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Low Stock Medicines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Obat Stok Rendah
            </CardTitle>
            <CardDescription>
              Obat dengan stok di bawah batas minimum
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : stats?.low_stock_medicines?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Obat</TableHead>
                    <TableHead className="text-right">Stok</TableHead>
                    <TableHead className="text-right">Minimum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.low_stock_medicines.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-mono text-xs">
                        {med.code}
                      </TableCell>
                      <TableCell className="font-medium">
                        {med.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">
                          {med.current_stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {med.minimum_stock}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                Semua obat stoknya aman
              </p>
            )}
          </CardContent>
        </Card>

        {/* Expiring Batches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-500" />
              Batch Mendekati Kadaluarsa
            </CardTitle>
            <CardDescription>
              Batch yang kadaluarsa dalam 30 hari ke depan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : stats?.expiring_batches?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obat</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Kadaluarsa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.expiring_batches.map((batch) => {
                    const days = daysUntil(batch.expiration_date);
                    return (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">
                          {batch.medicine_name}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {batch.batch_number}
                        </TableCell>
                        <TableCell className="text-right">
                          {batch.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              days <= 7 ? "destructive" : "secondary"
                            }
                          >
                            {days <= 0 ? "Kadaluarsa!" : `${days} hari lagi`}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                Tidak ada batch yang akan kadaluarsa
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
