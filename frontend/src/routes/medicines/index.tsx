import { MedicineListPage } from "@/components/pages/medicine/medicine-list-page";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { protectedRoute } from "@/middleware/helper/presets";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/medicines/")({
  beforeLoad: protectedRoute({ endpoint: "/medicine", method: "GET" }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout breadcrumb={[{ type: "page", label: "Medicine" }]}>
      <MedicineListPage />
    </DashboardLayout>
  );
}

export default RouteComponent;
