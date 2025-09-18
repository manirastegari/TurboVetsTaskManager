import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBACService } from '@turbo-vets-task-manager/auth';
import { User, Role } from '@turbo-vets-task-manager/data';

export interface RBACMetadata {
  resource: string;
  action: string;
}

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rbacMetadata = this.reflector.get<RBACMetadata>('rbac', context.getHandler());
    
    if (!rbacMetadata) {
      return true; // No RBAC metadata, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = RBACService.hasPermission(
      user.role,
      rbacMetadata.resource,
      rbacMetadata.action
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
