import { UsersListPage } from '@/components/pages/user/user-list-page'
import { DashboardLayout } from '@/layouts/dashboard-layout'
import { protectedRoute } from '@/middleware/helper/presets'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/users/')({
  beforeLoad: protectedRoute({ endpoint: '/users', method: 'GET' }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <DashboardLayout breadcrumb={[{type: "page", label: "Users"}]}>
        <UsersListPage />
    </DashboardLayout>
  )
}
