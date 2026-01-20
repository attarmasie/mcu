import { PatientListPage } from "@/components/pages/patient/patient-list-page";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { protectedRoute } from "@/middleware/helper/presets";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/patients/")({
  beforeLoad: protectedRoute({ endpoint: "/patients", method: "GET" }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout breadcrumb={[{ type: "page", label: "Patients" }]}>
      <PatientListPage />
    </DashboardLayout>
  );
}
