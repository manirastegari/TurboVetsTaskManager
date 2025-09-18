export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface CreateAuditLogDto {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}
