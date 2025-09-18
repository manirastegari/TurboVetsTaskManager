import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User, Organization, AuditLog])
  ],
  providers: [TasksService, AuditService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
