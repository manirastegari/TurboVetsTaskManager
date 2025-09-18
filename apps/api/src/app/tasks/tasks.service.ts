import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from '@turbo-vets-task-manager/data';
import { RBACService } from '@turbo-vets-task-manager/auth';
import { AuditService } from './audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private auditService: AuditService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdById: user.id,
      organizationId: user.organizationId,
    });

    const savedTask = await this.taskRepository.save(task);
    
    await this.auditService.logAction(
      user.id,
      'CREATE',
      'task',
      savedTask.id,
      `Created task: ${savedTask.title}`,
    );

    return savedTask;
  }

  async findAll(user: User): Promise<Task[]> {
    // Get tasks based on user's role and organization
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .where('task.organizationId = :organizationId', { organizationId: user.organizationId });

    // Viewers can only see tasks assigned to them or created by them
    if (user.role === 'viewer') {
      query.andWhere('(task.assignedToId = :userId OR task.createdById = :userId)', { userId: user.id });
    }

    return query.getMany();
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'organization'],
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Check if user can access this task
    if (!RBACService.canAccessResource(user.role, user.organizationId, task.organizationId)) {
      throw new ForbiddenException('Access denied');
    }

    // Additional check for viewers
    if (user.role === 'viewer' && task.assignedToId !== user.id && task.createdById !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);

    // Check if user can modify this task
    if (!RBACService.canModifyResource(user.role, user.organizationId, task.organizationId, task.createdById, user.id)) {
      throw new ForbiddenException('Insufficient permissions to modify this task');
    }

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.taskRepository.save(task);

    await this.auditService.logAction(
      user.id,
      'UPDATE',
      'task',
      updatedTask.id,
      `Updated task: ${updatedTask.title}`,
    );

    return updatedTask;
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);

    // Check if user can delete this task
    if (!RBACService.canModifyResource(user.role, user.organizationId, task.organizationId, task.createdById, user.id)) {
      throw new ForbiddenException('Insufficient permissions to delete this task');
    }

    await this.taskRepository.remove(task);

    await this.auditService.logAction(
      user.id,
      'DELETE',
      'task',
      id,
      `Deleted task: ${task.title}`,
    );
  }

  async updateStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
    return this.update(id, { status }, user);
  }
}
