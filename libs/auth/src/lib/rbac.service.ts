import { Role } from '@turbo-vets-task-manager/data';

export interface Permission {
  resource: string;
  action: string;
}

export class RBACService {
  private static readonly ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.OWNER]: [
      { resource: 'task', action: 'create' },
      { resource: 'task', action: 'read' },
      { resource: 'task', action: 'update' },
      { resource: 'task', action: 'delete' },
      { resource: 'user', action: 'create' },
      { resource: 'user', action: 'read' },
      { resource: 'user', action: 'update' },
      { resource: 'user', action: 'delete' },
      { resource: 'organization', action: 'create' },
      { resource: 'organization', action: 'read' },
      { resource: 'organization', action: 'update' },
      { resource: 'organization', action: 'delete' },
      { resource: 'audit', action: 'read' },
    ],
    [Role.ADMIN]: [
      { resource: 'task', action: 'create' },
      { resource: 'task', action: 'read' },
      { resource: 'task', action: 'update' },
      { resource: 'task', action: 'delete' },
      { resource: 'user', action: 'read' },
      { resource: 'user', action: 'update' },
      { resource: 'organization', action: 'read' },
      { resource: 'audit', action: 'read' },
    ],
    [Role.VIEWER]: [
      { resource: 'task', action: 'read' },
      { resource: 'user', action: 'read' },
      { resource: 'organization', action: 'read' },
    ],
  };

  static hasPermission(role: Role, resource: string, action: string): boolean {
    const permissions = this.ROLE_PERMISSIONS[role] || [];
    return permissions.some(
      (permission) => permission.resource === resource && permission.action === action
    );
  }

  static canAccessResource(userRole: Role, userOrgId: string, resourceOrgId: string): boolean {
    // Owners and Admins can access resources in their organization
    if (userRole === Role.OWNER || userRole === Role.ADMIN) {
      return userOrgId === resourceOrgId;
    }
    
    // Viewers can only access resources in their organization
    if (userRole === Role.VIEWER) {
      return userOrgId === resourceOrgId;
    }
    
    return false;
  }

  static canModifyResource(userRole: Role, userOrgId: string, resourceOrgId: string, resourceOwnerId: string, userId: string): boolean {
    // Must be in the same organization
    if (!this.canAccessResource(userRole, userOrgId, resourceOrgId)) {
      return false;
    }

    // Owners can modify any resource in their organization
    if (userRole === Role.OWNER) {
      return true;
    }

    // Admins can modify resources they created or are assigned to
    if (userRole === Role.ADMIN) {
      return resourceOwnerId === userId;
    }

    // Viewers cannot modify resources
    return false;
  }
}
