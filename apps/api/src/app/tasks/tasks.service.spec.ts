import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { CreateTaskDto, TaskStatus, TaskPriority, Role } from '@turbo-vets-task-manager/data';
import { AuditService } from './audit.service';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;
  let auditService: AuditService;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: Role.ADMIN,
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    category: 'Work',
    assignedToId: null,
    createdById: 'user-1',
    organizationId: 'org-1',
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Task;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAuditService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        priority: TaskPriority.HIGH,
        category: 'Work',
      };

      const createdTask = { ...mockTask, ...createTaskDto };
      mockTaskRepository.create.mockReturnValue(createdTask);
      mockTaskRepository.save.mockResolvedValue(createdTask);
      mockAuditService.logAction.mockResolvedValue({});

      const result = await service.create(createTaskDto, mockUser);

      expect(result).toEqual(createdTask);
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        createdById: mockUser.id,
        organizationId: mockUser.organizationId,
      });
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'CREATE',
        'task',
        createdTask.id,
        `Created task: ${createdTask.title}`
      );
    });
  });

  describe('findAll', () => {
    it('should return tasks for admin user', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      };

      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(mockUser);

      expect(result).toEqual([mockTask]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'task.organizationId = :organizationId',
        { organizationId: mockUser.organizationId }
      );
    });

    it('should return filtered tasks for viewer user', async () => {
      const viewerUser = { ...mockUser, role: Role.VIEWER };
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      };

      mockTaskRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(viewerUser);

      expect(result).toEqual([mockTask]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(task.assignedToId = :userId OR task.createdById = :userId)',
        { userId: viewerUser.id }
      );
    });
  });

  describe('findOne', () => {
    it('should return task if user has access', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('task-1', mockUser);

      expect(result).toEqual(mockTask);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        relations: ['assignedTo', 'createdBy', 'organization'],
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', mockUser)).rejects.toThrow('Task not found');
    });
  });

  describe('update', () => {
    it('should update task if user has permission', async () => {
      const updateData = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, ...updateData };

      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.save.mockResolvedValue(updatedTask);
      mockAuditService.logAction.mockResolvedValue({});

      const result = await service.update('task-1', updateData, mockUser);

      expect(result).toEqual(updatedTask);
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'UPDATE',
        'task',
        updatedTask.id,
        `Updated task: ${updatedTask.title}`
      );
    });
  });

  describe('remove', () => {
    it('should delete task if user has permission', async () => {
      mockTaskRepository.findOne.mockResolvedValue(mockTask);
      mockTaskRepository.remove.mockResolvedValue(mockTask);
      mockAuditService.logAction.mockResolvedValue({});

      await service.remove('task-1', mockUser);

      expect(mockTaskRepository.remove).toHaveBeenCalledWith(mockTask);
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'DELETE',
        'task',
        'task-1',
        `Deleted task: ${mockTask.title}`
      );
    });
  });
});
