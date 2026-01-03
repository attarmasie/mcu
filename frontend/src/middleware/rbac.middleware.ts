import { redirect } from '@tanstack/react-router'
import { canAccessRoute, type HttpMethod, type Role } from '@/generated/rbac'
import { decodeToken } from '@/lib/decode';

/**
 * Map frontend routes to backend API endpoints
 * Used when route path !== API endpoint path
 */
export const ROUTE_ENDPOINT_MAP: Record<string, { path: string; method: HttpMethod }> = {
  // Dashboard
  '/dashboard': { path: '/user', method: 'GET' },
}

export interface RBACMiddlewareOptions {
  /** API endpoint path (e.g., '/users', '/users/{id}') */
  endpoint?: string
  /** HTTP method to check */
  method?: HttpMethod
  /** Custom redirect path on failure */
  redirectTo?: string
  /** Skip auth check (for public routes) */
  skipAuth?: boolean
}

/**
 * Create RBAC middleware for TanStack Router
 * 
 * @example
 * // Auto-detect from route path
 * export const Route = createFileRoute('/dashboard/users/')({
 *   beforeLoad: RBACMiddleware(),
 * })
 * 
 * @example
 * // Custom endpoint mapping
 * export const Route = createFileRoute('/dashboard/users/create')({
 *   beforeLoad: RBACMiddleware({ endpoint: '/users', method: 'POST' }),
 * })
 * 
 * @example
 * // Skip auth for public routes
 * export const Route = createFileRoute('/about')({
 *   beforeLoad: RBACMiddleware({ skipAuth: true }),
 * })
 */
export function RBACMiddleware(options: RBACMiddlewareOptions = {}) {
  return async ({ location }: { location: { pathname: string } }) => {
    if (options.skipAuth) {
      return
    }

    const authToken = sessionStorage.getItem('authToken')
    if (!authToken) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      })
    }
    
    const user = decodeToken(authToken)
    
    if (!user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.pathname,
        },
      })
    }

    let endpoint = options.endpoint
    let method = options.method

    if (!endpoint || !method) {
      const mapped = getEndpointFromRoute(location.pathname)
      endpoint = mapped?.path || endpoint
      method = mapped?.method || method || 'GET'
    }

    if (!endpoint) {
      return
    }

    if (!user.role) {
      throw redirect({
        to: options.redirectTo || '/unauthorized',
      })
    }

    const hasAccess = canAccessRoute(user.role as Role, endpoint, method)

    if (!hasAccess) {
      throw redirect({
        to: options.redirectTo || '/unauthorized',
      })
    }
  }
}

/**
 * Middleware for routes that require specific endpoint check
 */
export function RBACEndpoint(endpoint: string, method: HttpMethod = 'GET') {
  return RBACMiddleware({ endpoint, method })
}

/**
 * Middleware for public routes (no auth required)
 */
export function PublicRoute() {
  return RBACMiddleware({ skipAuth: true })
}

/**
 * Middleware with custom redirect
 */
export function RBACWithRedirect(redirectTo: string, options: Omit<RBACMiddlewareOptions, 'redirectTo'> = {}) {
  return RBACMiddleware({ ...options, redirectTo })
}

/**
 * Get endpoint mapping from route path
 * Handles TanStack Router params ($id) and converts to OpenAPI params ({id})
 */
function getEndpointFromRoute(routePath: string): { path: string; method: HttpMethod } | null {
  // Try exact match first
  if (ROUTE_ENDPOINT_MAP[routePath]) {
    return ROUTE_ENDPOINT_MAP[routePath]
  }

  // Try pattern matching with params
  for (const [pattern, mapping] of Object.entries(ROUTE_ENDPOINT_MAP)) {
    if (matchRoutePattern(routePath, pattern)) {
      return mapping
    }
  }

  return null
}

/**
 * Match route path against pattern
 * /dashboard/users/123 matches /dashboard/users/$id
 */
function matchRoutePattern(path: string, pattern: string): boolean {
  const pathSegments = path.split('/').filter(Boolean)
  const patternSegments = pattern.split('/').filter(Boolean)

  if (pathSegments.length !== patternSegments.length) {
    return false
  }

  return patternSegments.every((segment, i) => {
    if (segment.startsWith('$')) return true
    return segment === pathSegments[i]
  })
}