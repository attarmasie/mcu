import { canAccessRoute } from "@/generated/rbac";
import { DashboardLayout } from "@/layouts/dashboard-layout";
import { protectedRoute } from "@/middleware/helper/presets";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  beforeLoad: protectedRoute({ endpoint: '/user', method: 'GET' }),
  component: RouteComponent,
});

function RouteComponent() {
  const canCreate = canAccessRoute('user', '/users', 'POST');

  console.log('Can create users:', canCreate);

  return (
    <DashboardLayout
      breadcrumb={[{ type: "page", label: "Dashboard" }]}
      >
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
        </div>
    </DashboardLayout>
  );
}
