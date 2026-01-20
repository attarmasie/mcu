import {
  type Role,
  type HttpMethod,
  canAccessResource,
  canAccessRoute,
  ROUTE_PERMISSIONS,
} from "@/generated/rbac"
import {
  Users,
  Accessibility,
  Settings,
  BarChart,
  Package,
  Home,
} from "lucide-react"

export interface NavigationItem {
  title: string
  url: string
  icon: any
  checkPath: string  // Path untuk checking permission
  checkMethod?: HttpMethod  // Optional: method untuk checking spesifik
  items?: {
    title: string
    url: string
    checkPath: string
    checkMethod?: HttpMethod  // Optional: method untuk checking
  }[]
}

/**
 * Hardcoded navigation structure
 * Edit this directly to customize your sidebar
 */
export const NAVIGATION: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    checkPath: "/users",
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    checkPath: "/users",  // Check if user can access /users
    // items: [
    //   {
    //     title: "All Users",
    //     url: "/users",
    //     checkPath: "/users",
    //     checkMethod: "GET",
    //   },
    //   {
    //     title: "Create User",
    //     url: "/users/create",
    //     checkPath: "/users",
    //     checkMethod: "POST",
    //   },
    // ],
  },
  {
    title: "Patients",
    url: "/patients",
    icon: Accessibility,
    checkPath: "/patients",
  },
  {
    title: "Orders",
    url: "/orders",
    icon: Package,
    checkPath: "/orders",
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart,
    checkPath: "/analytics",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    checkPath: "/settings",
  },
]

// ============================================================================
// NAVIGATION FILTERING BY PERMISSIONS
// ============================================================================

/**
 * Check if navigation item has permission in RBAC
 * Returns false if permission is not defined (item should be hidden)
 */
function hasPermissionDefined(checkPath: string, method?: HttpMethod): boolean {
  // Check if there's any permission defined for this path
  const permissions = ROUTE_PERMISSIONS.filter(p => p.path === checkPath)
  
  if (permissions.length === 0) {
    // No permission defined = should be hidden
    return false
  }
  
  // If method specified, check that specific method
  if (method) {
    return permissions.some(p => p.method === method)
  }
  
  // If no method specified, just check if any permission exists
  return true
}

/**
 * Check if user can access a navigation item
 */
function canAccessNavItem(
  item: { checkPath: string; checkMethod?: HttpMethod },
  userRole: Role
): boolean {
  // First check if permission is defined in RBAC
  if (!hasPermissionDefined(item.checkPath, item.checkMethod)) {
    return false  // No permission defined = hide
  }
  
  // Then check if user has access
  if (item.checkMethod) {
    // Check specific method access
    return canAccessRoute(userRole, item.checkPath, item.checkMethod)
  } else {
    // Check any access to the resource
    return canAccessResource(userRole, item.checkPath)
  }
}

/**
 * Filter navigation items based on user's role and permissions
 * 
 * Rules:
 * 1. If permission NOT defined in RBAC = HIDE
 * 2. If permission defined but user doesn't have access = HIDE
 * 3. If permission defined and user has access = SHOW
 * 4. Parent items are shown only if they or their children are accessible
 */
export function filterNavigationByPermissions(
  items: NavigationItem[],
  userRole: Role
): NavigationItem[] {
  return items
    .map(item => {
      // Filter sub-items first
      const filteredSubItems = item.items
        ? item.items.filter(subItem => canAccessNavItem(subItem, userRole))
        : undefined

      return {
        ...item,
        items: filteredSubItems,
      }
    })
    .filter(item => {
      // Case 1: Item has sub-items
      if (item.items !== undefined) {
        // Show parent only if it has at least one accessible sub-item
        return item.items.length > 0
      }
      
      // Case 2: Item has no sub-items (single menu item)
      // Check if item itself is accessible
      return canAccessNavItem(item, userRole)
    })
}

/**
 * Get navigation statistics for debugging
 */
export function getNavigationStats(userRole: Role) {
  const filtered = filterNavigationByPermissions(NAVIGATION, userRole)
  
  const totalOriginal = NAVIGATION.reduce(
    (acc, item) => acc + 1 + (item.items?.length || 0),
    0
  )
  
  const totalFiltered = filtered.reduce(
    (acc, item) => acc + 1 + (item.items?.length || 0),
    0
  )
  
  return {
    role: userRole,
    originalItems: NAVIGATION.length,
    filteredItems: filtered.length,
    totalOriginalLinks: totalOriginal,
    totalFilteredLinks: totalFiltered,
    hiddenLinks: totalOriginal - totalFiltered,
  }
}

/**
 * Print navigation stats to console (for debugging)
 */
export function debugNavigationPermissions(userRole: Role): void {
  const stats = getNavigationStats(userRole)
  
  console.log('\n=== Navigation Permission Stats ===')
  console.log(`Role: ${stats.role}`)
  console.log(`Parent Items: ${stats.filteredItems}/${stats.originalItems}`)
  console.log(`Total Links: ${stats.totalFilteredLinks}/${stats.totalOriginalLinks}`)
  console.log(`Hidden: ${stats.hiddenLinks}`)
  
  console.log('\n=== Visible Navigation ===')
  const filtered = filterNavigationByPermissions(NAVIGATION, userRole)
  filtered.forEach(item => {
    console.log(`✓ ${item.title}`)
    item.items?.forEach(sub => {
      console.log(`  ✓ ${sub.title}`)
    })
  })
}