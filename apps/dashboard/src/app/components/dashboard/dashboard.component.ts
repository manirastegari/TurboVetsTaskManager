import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority, User } from '@turbo-vets-task-manager/data';

type UserWithoutPassword = Omit<User, 'password'>;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div class="flex items-center">
              <h1 class="text-3xl font-bold text-gray-900">TurboVets Task Manager</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700">
                Welcome, {{ currentUser?.firstName }} {{ currentUser?.firstName }} ({{ currentUser?.role }})
              </span>
              <button
                (click)="logout()"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Task Creation Form -->
          <div class="mb-8" *ngIf="canCreateTask()">
            <div class="bg-white shadow rounded-lg p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Create New Task</h2>
              <form (ngSubmit)="createTask()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      [(ngModel)]="newTask.title"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Category</label>
                    <input
                      type="text"
                      [(ngModel)]="newTask.category"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Work, Personal, etc."
                      required
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    [(ngModel)]="newTask.description"
                    rows="3"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Task description"
                  ></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                      [(ngModel)]="newTask.priority"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      [(ngModel)]="newTask.dueDate"
                      class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    [disabled]="isCreating"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {{ isCreating ? 'Creating...' : 'Create Task' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Tasks List -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Tasks</h2>
            </div>
            <div class="p-6">
              <div *ngIf="isLoading" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p class="mt-2 text-gray-600">Loading tasks...</p>
              </div>
              
              <div *ngIf="!isLoading && tasks.length === 0" class="text-center py-8">
                <p class="text-gray-600">No tasks found. Create your first task above!</p>
              </div>

              <div *ngIf="!isLoading && tasks.length > 0" class="space-y-4">
                <div
                  *ngFor="let task of tasks"
                  class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h3 class="text-lg font-medium text-gray-900">{{ task.title }}</h3>
                      <p class="text-sm text-gray-600 mt-1">{{ task.description }}</p>
                      <div class="flex items-center space-x-4 mt-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="getStatusClass(task.status)">
                          {{ task.status | titlecase }}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              [ngClass]="getPriorityClass(task.priority)">
                          {{ task.priority | titlecase }}
                        </span>
                        <span class="text-xs text-gray-500">{{ task.category }}</span>
                        <span *ngIf="task.dueDate" class="text-xs text-gray-500">
                          Due: {{ task.dueDate | date:'short' }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <select
                        *ngIf="canUpdateTask(task)"
                        [value]="task.status"
                        (change)="updateTaskStatus(task.id, $event)"
                        class="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        *ngIf="canDeleteTask(task)"
                        (click)="deleteTask(task.id)"
                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: UserWithoutPassword | null = null;
  tasks: Task[] = [];
  isLoading = false;
  isCreating = false;
  
  newTask = {
    title: '',
    description: '',
    category: '',
    priority: TaskPriority.MEDIUM,
    dueDate: ''
  };

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading = false;
      }
    });
  }

  createTask(): void {
    if (!this.newTask.title || !this.newTask.category) return;
    
    this.isCreating = true;
    const taskData = {
      ...this.newTask,
      dueDate: this.newTask.dueDate ? new Date(this.newTask.dueDate) : undefined
    };

    this.taskService.createTask(taskData).subscribe({
      next: (task) => {
        this.tasks.unshift(task);
        this.newTask = {
          title: '',
          description: '',
          category: '',
          priority: TaskPriority.MEDIUM,
          dueDate: ''
        };
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.isCreating = false;
      }
    });
  }

  updateTaskStatus(taskId: string, event: any): void {
    const newStatus = event.target.value as TaskStatus;
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      },
      error: (error) => {
        console.error('Error updating task status:', error);
      }
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
        },
        error: (error) => {
          console.error('Error deleting task:', error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  canCreateTask(): boolean {
    return this.authService.canAccess('task', 'create');
  }

  canUpdateTask(task: Task): boolean {
    return this.authService.canAccess('task', 'update');
  }

  canDeleteTask(task: Task): boolean {
    return this.authService.canAccess('task', 'delete');
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-gray-100 text-gray-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case TaskStatus.DONE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800';
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
