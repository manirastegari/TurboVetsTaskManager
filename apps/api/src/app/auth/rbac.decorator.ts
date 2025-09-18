import { SetMetadata } from '@nestjs/common';

export const RBAC = (resource: string, action: string) => SetMetadata('rbac', { resource, action });
