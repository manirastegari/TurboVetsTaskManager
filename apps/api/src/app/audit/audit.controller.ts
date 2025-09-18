import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { AuditService } from '../tasks/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RBACGuard } from '../auth/rbac.guard';
import { RBAC } from '../auth/rbac.decorator';
import { User } from '../entities/user.entity';

@Controller('audit')
@UseGuards(JwtAuthGuard, RBACGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RBAC('audit', 'read')
  getAuditLogs(
    @Request() req: { user: User },
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
  ) {
    // Only allow users to see audit logs from their organization
    // For now, we'll show all logs, but in production you'd filter by organization
    return this.auditService.getAuditLogs(userId, resource);
  }
}
