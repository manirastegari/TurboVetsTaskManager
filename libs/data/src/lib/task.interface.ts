export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: string;
  assignedToId?: string;
  createdById: string;
  organizationId: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: TaskPriority;
  category: string;
  assignedToId?: string;
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  assignedToId?: string;
  dueDate?: Date;
}
