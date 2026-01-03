import { AuthMiddleware } from "../auth.middleware";
import { RBACMiddleware, type RBACMiddlewareOptions } from "../rbac.middleware";
import { compose } from "./composer";

/**
 * Standard protected route (Auth + RBAC)
 * 
 * @example
 * beforeLoad: protectedRoute({ endpoint: '/users', method: 'GET' })
 */
export function protectedRoute(options: RBACMiddlewareOptions = {}) {
  return compose(
    AuthMiddleware,
    RBACMiddleware(options)
  );
}

/**
 * Public route (no auth required)
 * 
 * @example
 * beforeLoad: publicRoute()
 */
export function publicRoute() {
  return RBACMiddleware({ skipAuth: true });
}

/**
 * Auth only (no RBAC check)
 * Useful for routes that only need authentication
 * 
 * @example
 * beforeLoad: authOnly()
 */
export function authOnly() {
  return compose(AuthMiddleware);
}