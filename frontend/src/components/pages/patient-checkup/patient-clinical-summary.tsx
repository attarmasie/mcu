import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useListPatientCheckups } from "@/generated/patient-checkups/patient-checkups";
import { useGetPatient } from "@/generated/patients/patients";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface PatientClinicalSummaryProps {
  patientId?: string;
  excludeCheckupId?: string;
}

export function PatientClinicalSummary({
  patientId,
  excludeCheckupId,
}: PatientClinicalSummaryProps) {
  const [historyPage, setHistoryPage] = useState(1);
  const [patientOpen, setPatientOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  useEffect(() => {
    setHistoryPage(1);
  }, [patientId, excludeCheckupId]);

  const { data: patientResp, isLoading: patientLoading } = useGetPatient(
    patientId ?? "",
    { query: { enabled: !!patientId } },
  );

  const { data: historyResp, isLoading: historyLoading } =
    useListPatientCheckups(
      {
        page: historyPage,
        per_page: 4,
        patient_id: patientId,
      },
      { query: { enabled: !!patientId } },
    );

  const patient = patientResp?.data;
  const filteredHistory = useMemo(
    () =>
      (historyResp?.data ?? []).filter((item) => item.id !== excludeCheckupId),
    [historyResp?.data, excludeCheckupId],
  );

  if (!patientId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Pilih patient dulu untuk melihat riwayat, alergi, dan detail klinis.
        </CardContent>
      </Card>
    );
  }
  const history = filteredHistory.slice(0, 3);
  const perPage = 4;
  const totalFromMeta = historyResp?.meta?.total ?? 0;
  const maxPage = Math.max(1, Math.ceil(totalFromMeta / perPage));
  const canPrev = historyPage > 1;
  const canNext = historyPage < maxPage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <Collapsible open={patientOpen} onOpenChange={setPatientOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0">
              <span className="font-medium">Patient Detail</span>
              {patientOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {patientLoading ? (
              <div className="text-muted-foreground">
                Loading patient detail...
              </div>
            ) : !patient ? (
              <div className="text-destructive">
                Patient detail tidak ditemukan.
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="font-medium">{patient.full_name}</div>
                  <div className="text-muted-foreground">
                    MRN: {patient.medical_record_number || "-"} | DOB:{" "}
                    {formatDate(patient.date_of_birth)}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-muted-foreground">Gender</div>
                    <div>{patient.gender}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Blood Type</div>
                    <div>{patient.blood_type || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Phone</div>
                    <div>{patient.phone_number || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Emergency</div>
                    <div>
                      {patient.emergency_contact_name || "-"}
                      {patient.emergency_contact_phone
                        ? ` (${patient.emergency_contact_phone})`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-muted-foreground">Allergies</div>
                  <div className="font-medium text-destructive">
                    {patient.allergies || "Tidak ada data alergi"}
                  </div>
                </div>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0">
              <span className="font-medium">Riwayat Checkup (3 terakhir)</span>
              {historyOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {historyLoading ? (
              <div className="text-muted-foreground">
                Loading riwayat checkup...
              </div>
            ) : history.length === 0 ? (
              <div className="text-muted-foreground">
                Belum ada riwayat checkup.
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Tanggal</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Keluhan</th>
                      <th className="p-2 text-left">Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} className="border-t align-top">
                        <td className="p-2">
                          {formatDateTime(item.visit_date)}
                        </td>
                        <td className="p-2">{item.status}</td>
                        <td className="p-2">{item.chief_complaint || "-"}</td>
                        <td className="p-2">{item.diagnosis || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setHistoryPage((p) => p - 1)}
                disabled={!canPrev || historyLoading}
              >
                Prev
              </Button>
              <div className="text-xs text-muted-foreground">
                Page {historyPage} / {maxPage}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setHistoryPage((p) => p + 1)}
                disabled={!canNext || historyLoading}
              >
                Next
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
