import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  Query 
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskStatus } from '@turbo-vets-task-manager/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RBACGuard } from '../auth/rbac.guard';
import { RBAC } from '../auth/rbac.decorator';
import { User } from '../entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RBACGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RBAC('task', 'create')
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: { user: User }) {
    return this.tasksService.create(createTaskDto, req.user);
  }

  @Get()
  @RBAC('task', 'read')
  findAll(@Request() req: { user: User }) {
    return this.tasksService.findAll(req.user);
  }

  @Get(':id')
  @RBAC('task', 'read')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.tasksService.findOne(id, req.user);
  }

  @Patch(':id')
  @RBAC('task', 'update')
  update(
    @Param('id') id: string, 
    @Body() updateTaskDto: UpdateTaskDto, 
    @Request() req: { user: User }
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Patch(':id/status')
  @RBAC('task', 'update')
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: TaskStatus, 
    @Request() req: { user: User }
  ) {
    return this.tasksService.updateStatus(id, status, req.user);
  }

  @Delete(':id')
  @RBAC('task', 'delete')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.tasksService.remove(id, req.user);
  }
}
