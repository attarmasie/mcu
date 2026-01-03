import { type ContextOptions } from "@tanstack/react-router";

/**
 * Middleware function type
 */
export type Middleware = (context: ContextOptions<any, any>) => Promise<void> | void;

/**
 * Compose multiple middlewares into one
 * Executes middlewares in order
 * 
 * @example
 * beforeLoad: compose(
 *   AuthMiddleware,
 *   RBACMiddleware({ endpoint: '/users', method: 'GET' })
 * )
 */
export function compose(...middlewares: Middleware[]): Middleware {
  return async (context: ContextOptions<any, any>) => {
    for (const middleware of middlewares) {
      await middleware(context);
    }
  };
}

/**
 * Conditional middleware execution
 * 
 * @example
 * beforeLoad: compose(
 *   when(isProduction, RateLimitMiddleware),
 *   AuthMiddleware
 * )
 */
export function when(condition: boolean, middleware: Middleware): Middleware {
  return async (context: ContextOptions<any, any>) => {
    if (condition) {
      await middleware(context);
    }
  };
}

/**
 * Skip middleware based on condition
 * 
 * @example
 * beforeLoad: compose(
 *   skip(isPublicRoute, AuthMiddleware),
 *   LoggingMiddleware
 * )
 */
export function skip(condition: boolean, middleware: Middleware): Middleware {
  return when(!condition, middleware);
}