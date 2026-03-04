import { DashboardPage } from "@/components/pages/dashboard/dashboard-page";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { protectedRoute } from "@/middleware/helper/presets";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: protectedRoute({ endpoint: "/dashboard/stats", method: "GET" }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout breadcrumb={[{ type: "page", label: "Dashboard" }]}>
      <DashboardPage />
    </DashboardLayout>
  );
}
