#!/usr/bin/env node

/**
 * RBAC Permission Generator
 * Reads OpenAPI spec and generates TypeScript RBAC config
 * Navigation is manually configured in AppSidebar
 */

/// <reference types="node" />

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

interface SecurityRequirement {
  [key: string]: string[];
}

interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
}

interface Operation {
  operationId?: string;
  summary?: string;
  tags?: string[];
  security?: SecurityRequirement[];
}

interface OpenAPISpec {
  paths: {
    [path: string]: PathItem;
  };
}

interface RoutePermission {
  path: string;
  method: string;
  operationId: string;
  roles: string[];
  tags: string[];
}

// Parse OpenAPI spec
function parseOpenAPISpec(filePath: string): OpenAPISpec {
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(content);
}

// Extract roles from security requirements
function extractRoles(security?: SecurityRequirement[]): string[] {
  if (!security || security.length === 0) return [];
  
  const roles = new Set<string>();
  security.forEach(requirement => {
    Object.values(requirement).forEach(roleList => {
      roleList.forEach(role => roles.add(role));
    });
  });
  
  return Array.from(roles);
}

// Extract all route permissions
function extractRoutePermissions(spec: OpenAPISpec): RoutePermission[] {
  const permissions: RoutePermission[] = [];
  
  Object.entries(spec.paths).forEach(([path, pathItem]) => {
    const methods = ['get', 'post', 'put', 'delete', 'patch'] as const;
    
    methods.forEach(method => {
      const operation = pathItem[method];
      if (!operation) return;
      
      permissions.push({
        path,
        method: method.toUpperCase(),
        operationId: operation.operationId || '',
        roles: extractRoles(operation.security),
        tags: operation.tags || [],
      });
    });
  });
  
  return permissions;
}

// Get all unique roles from permissions
function getAllRoles(permissions: RoutePermission[]): string[] {
  const roles = new Set<string>();
  permissions.forEach(p => p.roles.forEach(r => roles.add(r)));
  return Array.from(roles).sort();
}

// Group permissions by tag
function groupByTags(permissions: RoutePermission[]): Map<string, RoutePermission[]> {
  const grouped = new Map<string, RoutePermission[]>();
  
  permissions.forEach(permission => {
    permission.tags.forEach(tag => {
      if (!grouped.has(tag)) {
        grouped.set(tag, []);
      }
      grouped.get(tag)!.push(permission);
    });
  });
  
  return grouped;
}

// Generate TypeScript code
function generateTypeScript(
  permissions: RoutePermission[],
  groupedByTags: Map<string, RoutePermission[]>
): string {
  const allRoles = getAllRoles(permissions);
  
  return `/**
 * Auto-generated RBAC Permissions
 * Generated from OpenAPI specification
 * DO NOT EDIT MANUALLY
 * 
 * Navigation is manually configured in AppSidebar.tsx
 * This file only handles route permissions and access control
 */

// ============================================================================
// TYPES
// ============================================================================

export type Role = ${allRoles.map(r => `'${r}'`).join(' | ') || 'string'};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RoutePermission {
  path: string;
  method: HttpMethod;
  operationId: string;
  roles: Role[];
  tags: string[];
}

// ============================================================================
// ROUTE PERMISSIONS DATABASE
// ============================================================================

/**
 * Complete list of all route permissions from OpenAPI
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = ${JSON.stringify(permissions, null, 2)};

// ============================================================================
// PERMISSIONS BY TAG (for reference)
// ============================================================================

export const PERMISSIONS_BY_TAG = {
${Array.from(groupedByTags.entries())
  .map(([tag, perms]) => `  '${tag}': ${JSON.stringify(perms, null, 4)}`)
  .join(',\n')}
} as const;

// ============================================================================
// PERMISSIONS BY OPERATION ID (for quick lookup)
// ============================================================================

export const PERMISSIONS_BY_OPERATION_ID: Record<string, RoutePermission> = {
${permissions
  .filter(p => p.operationId)
  .map(p => `  '${p.operationId}': ${JSON.stringify(p, null, 4)}`)
  .join(',\n')}
};

// ============================================================================
// ROLE UTILITIES
// ============================================================================

export const ALL_ROLES: Role[] = ${JSON.stringify(allRoles)};

/**
 * Check if user has required role
 */
export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  // No roles required = public access
  if (requiredRoles.length === 0) return true;
  
  // Check if user role is in required roles
  return requiredRoles.includes(userRole);
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(userRole: Role, requiredRoles: Role[]): boolean {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
}

// ============================================================================
// ROUTE ACCESS CONTROL
// ============================================================================

/**
 * Check if user can access a specific route with method
 * 
 * @param userRole - Current user's role
 * @param path - Route path (e.g., "/users", "/users/{id}")
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @returns true if user has access, false otherwise
 * 
 * @example
 * canAccessRoute('admin', '/users', 'GET') // true if admin can list users
 * canAccessRoute('user', '/users', 'POST') // false if user can't create users
 */
export function canAccessRoute(
  userRole: Role,
  path: string,
  method: HttpMethod = 'GET'
): boolean {
  const permission = ROUTE_PERMISSIONS.find(
    p => p.path === path && p.method === method
  );
  
  // No permission defined = public access
  if (!permission) return true;
  
  // No roles required = public access
  if (permission.roles.length === 0) return true;
  
  // Check if user has required role
  return hasRole(userRole, permission.roles);
}

/**
 * Check if user can access a route by operation ID
 * 
 * @example
 * canAccessOperation('admin', 'createUser') // true if admin can create users
 */
export function canAccessOperation(
  userRole: Role,
  operationId: string
): boolean {
  const permission = PERMISSIONS_BY_OPERATION_ID[operationId];
  
  if (!permission) return true;
  if (permission.roles.length === 0) return true;
  
  return hasRole(userRole, permission.roles);
}

/**
 * Get all permissions for a specific path
 * Useful to check what methods are available
 * 
 * @example
 * getPathPermissions('/users')
 * // Returns: [{ method: 'GET', roles: ['admin'] }, { method: 'POST', roles: ['admin'] }]
 */
export function getPathPermissions(path: string): RoutePermission[] {
  return ROUTE_PERMISSIONS.filter(p => p.path === path);
}

/**
 * Get allowed methods for user on a specific path
 * 
 * @example
 * getAllowedMethods('user', '/products')
 * // Returns: ['GET'] if user can only view products
 */
export function getAllowedMethods(userRole: Role, path: string): HttpMethod[] {
  return ROUTE_PERMISSIONS
    .filter(p => p.path === path)
    .filter(p => p.roles.length === 0 || hasRole(userRole, p.roles))
    .map(p => p.method);
}

// ============================================================================
// URL PATTERN MATCHING
// ============================================================================

/**
 * Convert OpenAPI path pattern to regex
 * /users/{id} -> /users/[^/]+
 */
function pathToRegex(pattern: string): RegExp {
  const regexPattern = pattern
    .replace(/\{[^}]+\}/g, '[^/]+')  // Replace {id} with [^/]+
    .replace(new RegExp('/', 'g'), '\\/');   // Escape slashes
  return new RegExp(\`^\${regexPattern}$\`);
}

/**
 * Check if URL matches a path pattern
 * 
 * @example
 * matchPath('/users/123', '/users/{id}') // true
 * matchPath('/users', '/users/{id}') // false
 */
export function matchPath(url: string, pattern: string): boolean {
  return pathToRegex(pattern).test(url);
}

/**
 * Check if user can access a URL (with dynamic segments)
 * 
 * @example
 * canAccessUrl('admin', '/users/123', 'GET') // true if admin can get user by id
 * canAccessUrl('user', '/users/123', 'DELETE') // false if user can't delete
 */
export function canAccessUrl(
  userRole: Role,
  url: string,
  method: HttpMethod = 'GET'
): boolean {
  // Find matching permission by testing URL against all path patterns
  const permission = ROUTE_PERMISSIONS.find(
    p => p.method === method && matchPath(url, p.path)
  );
  
  // No permission found = public access
  if (!permission) return true;
  
  // No roles required = public access
  if (permission.roles.length === 0) return true;
  
  // Check if user has required role
  return hasRole(userRole, permission.roles);
}

/**
 * Get all permissions that match a URL
 */
export function getUrlPermissions(url: string): RoutePermission[] {
  return ROUTE_PERMISSIONS.filter(p => matchPath(url, p.path));
}

// ============================================================================
// PERMISSION CHECKING FOR UI
// ============================================================================

/**
 * Check if user can perform any action on a resource
 * Useful for showing/hiding menu items
 * 
 * @example
 * canAccessResource('user', '/products') // true if user can GET /products
 */
export function canAccessResource(
  userRole: Role,
  path: string
): boolean {
  const permissions = getPathPermissions(path);
  
  // No permissions = public
  if (permissions.length === 0) return true;
  
  // Check if user can access any method
  return permissions.some(p => 
    p.roles.length === 0 || hasRole(userRole, p.roles)
  );
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Get all accessible routes for a role
 * Useful for debugging and documentation
 */
export function getAccessibleRoutes(userRole: Role): RoutePermission[] {
  return ROUTE_PERMISSIONS.filter(p => 
    p.roles.length === 0 || hasRole(userRole, p.roles)
  );
}

/**
 * Print permission summary for a role
 */
export function printPermissionSummary(userRole: Role): void {
  const accessible = getAccessibleRoutes(userRole);
  
  console.log(\`\\n=== Permissions for role: \${userRole} ===\`);
  console.log(\`Total accessible routes: \${accessible.length}\`);
  
  const byMethod = accessible.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('By method:', byMethod);
  console.log('\\nRoutes:');
  accessible.forEach(p => {
    console.log(\`  \${p.method.padEnd(6)} \${p.path}\`);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  ROUTE_PERMISSIONS,
  PERMISSIONS_BY_TAG,
  PERMISSIONS_BY_OPERATION_ID,
  ALL_ROLES,
  
  // Role checks
  hasRole,
  hasAnyRole,
  
  // Route access
  canAccessRoute,
  canAccessOperation,
  canAccessUrl,
  canAccessResource,
  
  // Utilities
  getPathPermissions,
  getAllowedMethods,
  getUrlPermissions,
  getAccessibleRoutes,
  
  // Pattern matching
  matchPath,
  
  // Debug
  printPermissionSummary,
};
`;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: generate-rbac.ts <input-openapi.yaml> <output-rbac.ts>');
    process.exit(1);
  }
  
  const [inputPath, outputPath] = args;
  
  console.log('🔍 Reading OpenAPI spec from:', inputPath);
  const spec = parseOpenAPISpec(inputPath);
  
  console.log('📝 Extracting route permissions...');
  const permissions = extractRoutePermissions(spec);
  
  console.log('🏷️  Grouping by tags...');
  const groupedByTags = groupByTags(permissions);
  
  console.log('⚙️  Generating TypeScript code...');
  const tsCode = generateTypeScript(permissions, groupedByTags);
  
  console.log('💾 Writing to:', outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, tsCode, 'utf8');
  
  console.log('✅ RBAC permissions generated successfully!');
  console.log(`📊 Found ${permissions.length} route permissions`);
  console.log(`👥 Found ${getAllRoles(permissions).length} roles`);
  console.log(`🎯 Total paths: ${new Set(permissions.map(p => p.path)).size}`);
}

main();