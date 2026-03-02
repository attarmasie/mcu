import { PatientCheckupListPage } from "@/components/pages/patient-checkup/patient-checkup-list-page";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { protectedRoute } from "@/middleware/helper/presets";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/patient-checkups/")({
  beforeLoad: protectedRoute({ endpoint: "/patient-checkups", method: "GET" }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout breadcrumb={[{ type: "page", label: "Patient Checkups" }]}>
      <PatientCheckupListPage />
    </DashboardLayout>
  );
}
