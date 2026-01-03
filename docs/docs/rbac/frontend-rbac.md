# Middleware System

Sistem middleware untuk route protection di TanStack Router dengan support untuk composable middleware chains.

## Kegunaan

Middleware system ini menyediakan:
- ✅ **Authentication** - Cek apakah user sudah login
- ✅ **Authorization (RBAC)** - Cek apakah user punya akses
- ✅ **Composition** - Gabungkan multiple middleware
- ✅ **Conditional Execution** - Jalankan middleware berdasarkan kondisi

## Manfaat

### Tanpa Middleware System
```tsx
// ❌ Manual check di setiap halaman
function AdminPage() {
  const user = useAuth()
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/unauthorized" />
  return <div>Admin Content</div>
}
```

### Dengan Middleware System
```tsx
// ✅ Declarative & reusable
export const Route = createFileRoute('/admin')({
  beforeLoad: protectedRoute({ endpoint: '/admin', method: 'GET' }),
  component: AdminPage,
})
```

---

## Preset Middleware

### 1. `protectedRoute(options)`

Route yang memerlukan **Auth + RBAC** check.

```tsx
import { protectedRoute } from '@/middleware/presets'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: protectedRoute({ 
    endpoint: '/user', 
    method: 'GET' 
  }),
  component: DashboardPage,
})
```

### 2. `publicRoute()`

Route **tanpa** auth requirement (halaman publik).

```tsx
import { publicRoute } from '@/middleware/presets'

export const Route = createFileRoute('/about')({
  beforeLoad: publicRoute(),
  component: AboutPage,
})
```

### 3. `authOnly()`

Route yang **hanya butuh authentication** tanpa RBAC check.

```tsx
import { authOnly } from '@/middleware/presets'

export const Route = createFileRoute('/profile')({
  beforeLoad: authOnly(),
  component: ProfilePage,
})
```

---

## Middleware Composition

### `compose(...middlewares)`

Gabungkan beberapa middleware menjadi satu chain.

```tsx
import { compose } from '@/middleware/composer'
import { AuthMiddleware } from '@/middleware/auth.middleware'
import { LoggingMiddleware } from '@/middleware/logging.middleware'
import { RateLimitMiddleware } from '@/middleware/rate-limit.middleware'

export const Route = createFileRoute('/api/heavy-operation')({
  beforeLoad: compose(
    AuthMiddleware,
    RateLimitMiddleware,
    LoggingMiddleware
  ),
  component: HeavyOperationPage,
})
```

**Execution order:** Middleware dijalankan **berurutan** dari atas ke bawah.

### `when(condition, middleware)`

Jalankan middleware **hanya jika kondisi true**.

```tsx
import { compose, when } from '@/middleware/composer'
import { AnalyticsMiddleware } from '@/middleware/analytics.middleware'

const isProduction = import.meta.env.PROD

export const Route = createFileRoute('/dashboard/analytics')({
  beforeLoad: compose(
    protectedRoute({ endpoint: '/analytics', method: 'GET' }),
    when(isProduction, AnalyticsMiddleware) // Hanya di production
  ),
  component: AnalyticsPage,
})
```

### `skip(condition, middleware)`

**Skip** middleware jika kondisi true (kebalikan dari `when`).

```tsx
import { compose, skip } from '@/middleware/composer'
import { AuthMiddleware } from '@/middleware/auth.middleware'

const isMaintenanceMode = false

export const Route = createFileRoute('/app')({
  beforeLoad: compose(
    skip(isMaintenanceMode, AuthMiddleware), // Skip auth saat maintenance
    LoggingMiddleware
  ),
  component: AppPage,
})
```

---

## RBAC Middleware Usage

RBAC Middleware bisa digunakan **standalone** atau **di-compose** dengan middleware lain.

### 1. Auto-detect dari Mapping

Middleware otomatis ambil endpoint dari `ROUTE_ENDPOINT_MAP`:

```tsx
import { RBACMiddleware } from '@/middleware/rbac.middleware'

export const Route = createFileRoute('/dashboard/users/')({
  beforeLoad: RBACMiddleware(),  // Auto-detect dari mapping
  component: UsersPage,
})
```

**Requirement:** Harus ada mapping di `ROUTE_ENDPOINT_MAP`:
```tsx
ROUTE_ENDPOINT_MAP: {
  '/dashboard/users/': { path: '/users', method: 'GET' }
}
```

### 2. Explicit Endpoint

Specify endpoint secara manual (recommended untuk clarity):

```tsx
export const Route = createFileRoute('/dashboard/users/create')({
  beforeLoad: RBACMiddleware({ 
    endpoint: '/users', 
    method: 'POST' 
  }),
  component: CreateUserPage,
})
```

### 3. Dynamic Routes

Untuk route dengan parameter dinamis:

```tsx
import { RBACEndpoint } from '@/middleware/rbac.middleware'

export const Route = createFileRoute('/dashboard/users/$id/edit')({
  beforeLoad: RBACEndpoint('/users/{id}', 'PUT'),
  component: EditUserPage,
})
```

**Note:** Gunakan `{id}` untuk OpenAPI style params, bukan `$id`.

### 4. Public Route

Route yang tidak perlu authentication:

```tsx
import { PublicRoute } from '@/middleware/rbac.middleware'

export const Route = createFileRoute('/about')({
  beforeLoad: PublicRoute(),
  component: AboutPage,
})
```

### 5. Custom Redirect

Redirect ke halaman custom jika akses ditolak:

```tsx
import { RBACWithRedirect } from '@/middleware/rbac.middleware'

export const Route = createFileRoute('/admin/settings')({
  beforeLoad: RBACWithRedirect('/dashboard', {
    endpoint: '/admin/settings',
    method: 'GET',
  }),
  component: AdminSettingsPage,
})
```

### 6. Compose dengan Middleware Lain

Combine RBAC dengan middleware lain menggunakan `compose`:

```tsx
import { compose } from '@/middleware/composer'
import { RBACMiddleware } from '@/middleware/rbac.middleware'
import { LoggingMiddleware } from '@/middleware/logging.middleware'

export const Route = createFileRoute('/dashboard/users')({
  beforeLoad: compose(
    RBACMiddleware({ endpoint: '/users', method: 'GET' }),
    LoggingMiddleware
  ),
  component: UsersPage,
})
```

### 7. Multiple RBAC Checks

Check multiple permissions dalam satu route:

```tsx
import { compose } from '@/middleware/composer'
import { RBACMiddleware } from '@/middleware/rbac.middleware'

export const Route = createFileRoute('/dashboard/admin/reports')({
  beforeLoad: compose(
    RBACMiddleware({ endpoint: '/admin', method: 'GET' }),
    RBACMiddleware({ endpoint: '/reports', method: 'GET' })
  ),
  component: AdminReportsPage,
})
```

User harus punya akses ke **kedua** endpoint untuk bisa akses halaman ini.

### 8. Conditional RBAC

Jalankan RBAC check berdasarkan kondisi tertentu:

```tsx
import { compose, when } from '@/middleware/composer'
import { RBACMiddleware } from '@/middleware/rbac.middleware'
import { AuthMiddleware } from '@/middleware/auth.middleware'

const requireAdminInProd = import.meta.env.PROD

export const Route = createFileRoute('/dashboard/debug')({
  beforeLoad: compose(
    AuthMiddleware,
    when(requireAdminInProd, RBACMiddleware({ 
      endpoint: '/admin/debug', 
      method: 'GET' 
    }))
  ),
  component: DebugPage,
})
```

Di development, semua authenticated user bisa akses. Di production, hanya admin.

---

## Contoh Penggunaan Lengkap

### Multiple RBAC Checks

Cek multiple permissions dalam satu route:

```tsx
import { compose } from '@/middleware/composer'
import { AuthMiddleware } from '@/middleware/auth.middleware'
import { RBACMiddleware } from '@/middleware/rbac.middleware'

export const Route = createFileRoute('/dashboard/admin/users')({
  beforeLoad: compose(
    AuthMiddleware,
    RBACMiddleware({ endpoint: '/admin', method: 'GET' }),
    RBACMiddleware({ endpoint: '/users', method: 'GET' })
  ),
  component: AdminUsersPage,
})
```

### Complex Middleware Chain

Combine multiple concerns dalam satu route:

```tsx
import { compose } from '@/middleware/composer'
import { 
  AuthMiddleware,
  CacheMiddleware, 
  RBACMiddleware,
  AuditLogMiddleware 
} from '@/middleware'

export const Route = createFileRoute('/dashboard/sensitive-data')({
  beforeLoad: compose(
    CacheMiddleware,           // 1. Check cache
    AuthMiddleware,            // 2. Authenticate
    RBACMiddleware({           // 3. Authorize
      endpoint: '/sensitive-data',
      method: 'GET'
    }),
    AuditLogMiddleware         // 4. Log access
  ),
  component: SensitiveDataPage,
})
```

### Truly Public Route

Route tanpa middleware sama sekali:

```tsx
export const Route = createFileRoute('/ping')({
  // No beforeLoad - completely public
  component: () => <div>pong</div>,
})
```

---

## API Reference

### Preset Functions

| Function | Deskripsi | Use Case |
|----------|-----------|----------|
| `protectedRoute(options)` | Auth + RBAC check | Dashboard, admin pages |
| `publicRoute()` | No auth required | Landing page, about |
| `authOnly()` | Auth tanpa RBAC | Profile, settings |

### Composer Functions

| Function | Signature | Deskripsi |
|----------|-----------|-----------|
| `compose` | `(...middlewares) => Middleware` | Gabungkan middleware secara berurutan |
| `when` | `(condition, middleware) => Middleware` | Jalankan jika kondisi `true` |
| `skip` | `(condition, middleware) => Middleware` | Skip jika kondisi `true` |

### RBAC Options

```typescript
interface RBACMiddlewareOptions {
  endpoint?: string      // API endpoint path
  method?: HttpMethod    // GET, POST, PUT, DELETE
  redirectTo?: string    // Custom redirect path
  skipAuth?: boolean     // Skip auth check
}
```

---

## Cara Kerja Composition

```
Request → compose(A, B, C)
            ↓
         Execute A
            ↓
         Execute B
            ↓
         Execute C
            ↓
       Render Page
```

Jika salah satu middleware **throw redirect**, execution chain berhenti dan user di-redirect.

---

## Best Practices

### 1. Gunakan Preset untuk Use Case Umum

```tsx
// ✅ BAIK - Pakai preset
beforeLoad: protectedRoute({ endpoint: '/users', method: 'GET' })

// ❌ VERBOSE - Manual compose
beforeLoad: compose(AuthMiddleware, RBACMiddleware({ endpoint: '/users', method: 'GET' }))
```

### 2. Order Middleware Secara Logical

```tsx
// ✅ BENAR - Cache → Auth → RBAC → Logging
compose(
  CacheMiddleware,
  AuthMiddleware,
  RBACMiddleware({ endpoint: '/data', method: 'GET' }),
  LoggingMiddleware
)

// ❌ SALAH - Logging sebelum Auth (tidak efisien)
compose(
  LoggingMiddleware,
  AuthMiddleware,
  CacheMiddleware
)
```

### 3. Use `when` untuk Feature Flags

```tsx
compose(
  protectedRoute({ endpoint: '/users', method: 'GET' }),
  when(import.meta.env.VITE_ANALYTICS_ENABLED === 'true', AnalyticsMiddleware)
)
```

### 4. Jangan Over-compose

```tsx
// ✅ BAIK - Simple & clear
beforeLoad: protectedRoute({ endpoint: '/users', method: 'GET' })

// ❌ OVERKILL - Terlalu banyak middleware untuk simple page
beforeLoad: compose(
  CacheMiddleware,
  AuthMiddleware,
  RBACMiddleware({ endpoint: '/users', method: 'GET' }),
  LoggingMiddleware,
  AnalyticsMiddleware,
  PerformanceMiddleware,
  DebugMiddleware
)
```

---

## Troubleshooting

**Middleware tidak jalan berurutan:**
- Pastikan middleware return `Promise<void>` atau `void`
- Gunakan `async/await` jika middleware async

**Condition di `when`/`skip` tidak bekerja:**
- Pastikan condition adalah boolean, bukan function
- Evaluasi condition di luar component (top-level)

**Redirect tidak bekerja:**
- Pastikan middleware throw `redirect()` dari TanStack Router
- Check apakah ada middleware lain yang catch error