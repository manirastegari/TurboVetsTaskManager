import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { CreateAuditLogDto } from '@turbo-vets-task-manager/data';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });

    return this.auditLogRepository.save(auditLog);
  }

  async getAuditLogs(userId?: string, resource?: string): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .orderBy('auditLog.createdAt', 'DESC');

    if (userId) {
      query.andWhere('auditLog.userId = :userId', { userId });
    }

    if (resource) {
      query.andWhere('auditLog.resource = :resource', { resource });
    }

    return query.getMany();
  }
}
