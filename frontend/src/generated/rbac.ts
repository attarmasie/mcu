/**
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

export type Role = 'admin' | 'user';

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
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  {
    "path": "/auth/register",
    "method": "POST",
    "operationId": "register",
    "roles": [],
    "tags": [
      "auth"
    ]
  },
  {
    "path": "/auth/login",
    "method": "POST",
    "operationId": "login",
    "roles": [],
    "tags": [
      "auth"
    ]
  },
  {
    "path": "/auth/me",
    "method": "GET",
    "operationId": "getCurrentUser",
    "roles": [
      "user",
      "admin"
    ],
    "tags": [
      "auth"
    ]
  },
  {
    "path": "/users",
    "method": "GET",
    "operationId": "listUsers",
    "roles": [
      "admin"
    ],
    "tags": [
      "users"
    ]
  },
  {
    "path": "/users",
    "method": "POST",
    "operationId": "createUser",
    "roles": [
      "admin"
    ],
    "tags": [
      "users"
    ]
  },
  {
    "path": "/users/{id}",
    "method": "GET",
    "operationId": "getUser",
    "roles": [
      "admin"
    ],
    "tags": [
      "users"
    ]
  },
  {
    "path": "/users/{id}",
    "method": "PUT",
    "operationId": "updateUser",
    "roles": [
      "admin"
    ],
    "tags": [
      "users"
    ]
  },
  {
    "path": "/users/{id}",
    "method": "DELETE",
    "operationId": "deleteUser",
    "roles": [
      "admin"
    ],
    "tags": [
      "users"
    ]
  },
  {
    "path": "/products",
    "method": "GET",
    "operationId": "listProducts",
    "roles": [],
    "tags": [
      "products"
    ]
  },
  {
    "path": "/products",
    "method": "POST",
    "operationId": "createProduct",
    "roles": [],
    "tags": [
      "products"
    ]
  },
  {
    "path": "/products/{id}",
    "method": "GET",
    "operationId": "getProduct",
    "roles": [],
    "tags": [
      "products"
    ]
  },
  {
    "path": "/products/{id}",
    "method": "PUT",
    "operationId": "updateProduct",
    "roles": [],
    "tags": [
      "products"
    ]
  },
  {
    "path": "/products/{id}",
    "method": "DELETE",
    "operationId": "deleteProduct",
    "roles": [],
    "tags": [
      "products"
    ]
  }
];

// ============================================================================
// PERMISSIONS BY TAG (for reference)
// ============================================================================

export const PERMISSIONS_BY_TAG = {
  'auth': [
    {
        "path": "/auth/register",
        "method": "POST",
        "operationId": "register",
        "roles": [],
        "tags": [
            "auth"
        ]
    },
    {
        "path": "/auth/login",
        "method": "POST",
        "operationId": "login",
        "roles": [],
        "tags": [
            "auth"
        ]
    },
    {
        "path": "/auth/me",
        "method": "GET",
        "operationId": "getCurrentUser",
        "roles": [
            "user",
            "admin"
        ],
        "tags": [
            "auth"
        ]
    }
],
  'users': [
    {
        "path": "/users",
        "method": "GET",
        "operationId": "listUsers",
        "roles": [
            "admin"
        ],
        "tags": [
            "users"
        ]
    },
    {
        "path": "/users",
        "method": "POST",
        "operationId": "createUser",
        "roles": [
            "admin"
        ],
        "tags": [
            "users"
        ]
    },
    {
        "path": "/users/{id}",
        "method": "GET",
        "operationId": "getUser",
        "roles": [
            "admin"
        ],
        "tags": [
            "users"
        ]
    },
    {
        "path": "/users/{id}",
        "method": "PUT",
        "operationId": "updateUser",
        "roles": [
            "admin"
        ],
        "tags": [
            "users"
        ]
    },
    {
        "path": "/users/{id}",
        "method": "DELETE",
        "operationId": "deleteUser",
        "roles": [
            "admin"
        ],
        "tags": [
            "users"
        ]
    }
],
  'products': [
    {
        "path": "/products",
        "method": "GET",
        "operationId": "listProducts",
        "roles": [],
        "tags": [
            "products"
        ]
    },
    {
        "path": "/products",
        "method": "POST",
        "operationId": "createProduct",
        "roles": [],
        "tags": [
            "products"
        ]
    },
    {
        "path": "/products/{id}",
        "method": "GET",
        "operationId": "getProduct",
        "roles": [],
        "tags": [
            "products"
        ]
    },
    {
        "path": "/products/{id}",
        "method": "PUT",
        "operationId": "updateProduct",
        "roles": [],
        "tags": [
            "products"
        ]
    },
    {
        "path": "/products/{id}",
        "method": "DELETE",
        "operationId": "deleteProduct",
        "roles": [],
        "tags": [
            "products"
        ]
    }
]
} as const;

// ============================================================================
// PERMISSIONS BY OPERATION ID (for quick lookup)
// ============================================================================

export const PERMISSIONS_BY_OPERATION_ID: Record<string, RoutePermission> = {
  'register': {
    "path": "/auth/register",
    "method": "POST",
    "operationId": "register",
    "roles": [],
    "tags": [
        "auth"
    ]
},
  'login': {
    "path": "/auth/login",
    "method": "POST",
    "operationId": "login",
    "roles": [],
    "tags": [
        "auth"
    ]
},
  'getCurrentUser': {
    "path": "/auth/me",
    "method": "GET",
    "operationId": "getCurrentUser",
    "roles": [
        "user",
        "admin"
    ],
    "tags": [
        "auth"
    ]
},
  'listUsers': {
    "path": "/users",
    "method": "GET",
    "operationId": "listUsers",
    "roles": [
        "admin"
    ],
    "tags": [
        "users"
    ]
},
  'createUser': {
    "path": "/users",
    "method": "POST",
    "operationId": "createUser",
    "roles": [
        "admin"
    ],
    "tags": [
        "users"
    ]
},
  'getUser': {
    "path": "/users/{id}",
    "method": "GET",
    "operationId": "getUser",
    "roles": [
        "admin"
    ],
    "tags": [
        "users"
    ]
},
  'updateUser': {
    "path": "/users/{id}",
    "method": "PUT",
    "operationId": "updateUser",
    "roles": [
        "admin"
    ],
    "tags": [
        "users"
    ]
},
  'deleteUser': {
    "path": "/users/{id}",
    "method": "DELETE",
    "operationId": "deleteUser",
    "roles": [
        "admin"
    ],
    "tags": [
        "users"
    ]
},
  'listProducts': {
    "path": "/products",
    "method": "GET",
    "operationId": "listProducts",
    "roles": [],
    "tags": [
        "products"
    ]
},
  'createProduct': {
    "path": "/products",
    "method": "POST",
    "operationId": "createProduct",
    "roles": [],
    "tags": [
        "products"
    ]
},
  'getProduct': {
    "path": "/products/{id}",
    "method": "GET",
    "operationId": "getProduct",
    "roles": [],
    "tags": [
        "products"
    ]
},
  'updateProduct': {
    "path": "/products/{id}",
    "method": "PUT",
    "operationId": "updateProduct",
    "roles": [],
    "tags": [
        "products"
    ]
},
  'deleteProduct': {
    "path": "/products/{id}",
    "method": "DELETE",
    "operationId": "deleteProduct",
    "roles": [],
    "tags": [
        "products"
    ]
}
};

// ============================================================================
// ROLE UTILITIES
// ============================================================================

export const ALL_ROLES: Role[] = ["admin","user"];

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
    .replace(/{[^}]+}/g, '[^/]+')  // Replace {id} with [^/]+
    .replace(new RegExp('/', 'g'), '\/');   // Escape slashes
  return new RegExp(`^${regexPattern}$`);
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
  
  console.log(`\n=== Permissions for role: ${userRole} ===`);
  console.log(`Total accessible routes: ${accessible.length}`);
  
  const byMethod = accessible.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('By method:', byMethod);
  console.log('\nRoutes:');
  accessible.forEach(p => {
    console.log(`  ${p.method.padEnd(6)} ${p.path}`);
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
