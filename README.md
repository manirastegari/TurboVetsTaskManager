# TurboVets Task Management System

A secure task management system built with NX monorepo, featuring role-based access control (RBAC) and JWT authentication.

## Architecture Overview

This project uses an NX monorepo structure with the following components:

### Apps
- **`apps/api`** - NestJS backend API with TypeORM and SQLite
- **`apps/dashboard`** - Angular frontend with TailwindCSS

### Libraries
- **`libs/data`** - Shared TypeScript interfaces and DTOs
- **`libs/auth`** - RBAC logic and JWT authentication utilities

## Project Structure

```
TurboVetsTaskManager/
├── apps/
│   ├── api/                 # NestJS Backend
│   └── dashboard/           # Angular Frontend
├── libs/
│   ├── data/               # Shared Data Models
│   └── auth/               # Authentication & RBAC
├── package.json
├── nx.json
└── tsconfig.base.json
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
npm install
```

### Development
```bash
# Start backend API
nx serve api

# Start frontend dashboard
nx serve dashboard
```

## Data Models

### User
- Basic user information with role-based access
- Roles: Owner, Admin, Viewer
- Organization-based hierarchy

### Organization
- 2-level hierarchy support
- Parent-child organization relationships

### Task
- Task management with status, priority, and categories
- Organization-scoped access control
- Assignment and due date support

### Audit Log
- Track all user actions and access
- Security and compliance logging

## Access Control Design

The system implements a comprehensive RBAC system:

- **Owner**: Full access to organization resources
- **Admin**: Manage tasks and users within organization
- **Viewer**: Read-only access to organization resources

All access is scoped to the user's organization with proper permission checks.

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "owner@turbovets.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "owner@turbovets.com",
    "firstName": "John",
    "lastName": "Owner",
    "role": "owner",
    "organizationId": "uuid",
    "createdAt": "2025-09-18T21:15:15.000Z",
    "updatedAt": "2025-09-18T21:15:15.000Z"
  }
}
```

#### POST /api/auth/register
Register a new user (requires authentication).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "New",
  "lastName": "User",
  "role": "viewer",
  "organizationId": "uuid"
}
```

### Task Management Endpoints

#### GET /api/tasks
Get all tasks accessible to the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Complete project documentation",
    "description": "Write comprehensive API documentation",
    "status": "in_progress",
    "priority": "high",
    "category": "Work",
    "assignedToId": "uuid",
    "createdById": "uuid",
    "organizationId": "uuid",
    "dueDate": "2025-09-25T00:00:00.000Z",
    "createdAt": "2025-09-18T21:15:15.000Z",
    "updatedAt": "2025-09-18T21:15:15.000Z"
  }
]
```

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "category": "Work",
  "assignedToId": "uuid",
  "dueDate": "2025-09-25T00:00:00.000Z"
}
```

#### PATCH /api/tasks/:id
Update a task.

#### PATCH /api/tasks/:id/status
Update task status.

**Request Body:**
```json
{
  "status": "done"
}
```

#### DELETE /api/tasks/:id
Delete a task.

### User Management Endpoints

#### GET /api/users
Get all users accessible to the current user.

#### POST /api/users
Create a new user (Owner/Admin only).

#### GET /api/users/:id
Get user by ID.

#### PATCH /api/users/:id
Update user information.

#### DELETE /api/users/:id
Delete a user.

### Organization Management Endpoints

#### GET /api/organizations
Get all organizations accessible to the current user.

#### POST /api/organizations
Create a new organization (Owner only).

#### GET /api/organizations/:id
Get organization by ID.

#### PATCH /api/organizations/:id
Update organization information.

#### DELETE /api/organizations/:id
Delete an organization.

### Audit Log Endpoints

#### GET /api/audit
Get audit logs (Owner/Admin only).

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `resource` (optional): Filter by resource type

## Role-Based Access Control (RBAC)

### Roles and Permissions

#### Owner
- **Full access** to all resources in their organization
- Can create, read, update, and delete users, tasks, and organizations
- Can view audit logs
- Can manage all users in their organization

#### Admin
- Can create, read, update, and delete tasks
- Can read and update users (only those they created)
- Can read organizations
- Can view audit logs
- Cannot delete users or organizations

#### Viewer
- **Read-only access** to tasks, users, and organizations
- Can only see tasks assigned to them or created by them
- Can only see their own user information
- Cannot create, update, or delete any resources

### Organization Hierarchy

The system supports a 2-level organization hierarchy:
- **Parent Organization**: Top-level organization (e.g., "TurboVets Corp")
- **Child Organization**: Sub-organizations (e.g., "Engineering Team")

Access is scoped to the user's organization and its children.

## Test Accounts

The system comes with pre-seeded test accounts:

| Email | Password | Role | Organization |
|-------|----------|------|--------------|
| owner@turbovets.com | password123 | Owner | TurboVets Corp |
| admin@turbovets.com | password123 | Admin | Engineering Team |
| viewer@turbovets.com | password123 | Viewer | Engineering Team |

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Role-Based Access Control**: Granular permissions system
- **Organization Scoping**: Data isolation between organizations
- **Audit Logging**: Complete action tracking
- **Input Validation**: Request validation and sanitization
- **CORS Protection**: Configured for frontend integration

## Development

### Running the Application

```bash
# Install dependencies
npm install

# Start backend API
nx serve api

# Start frontend dashboard
nx serve dashboard
```

### Testing

```bash
# Run backend tests
nx test api

# Run frontend tests
nx test dashboard

# Run all tests
nx run-many --target=test --all
```

### Building for Production

```bash
# Build backend
nx build api

# Build frontend
nx build dashboard

# Build all
nx run-many --target=build --all
```

## Architecture Decisions

### Database Choice
- **SQLite**: Chosen for simplicity and portability
- **TypeORM**: Object-relational mapping with decorators
- **Entity-based**: Clear data models with relationships

### Authentication Strategy
- **JWT Tokens**: Stateless authentication
- **Bearer Token**: Standard HTTP header authentication
- **Token Expiration**: 24-hour token lifetime

### Frontend Architecture
- **Angular Standalone Components**: Modern Angular approach
- **Service-based**: Clean separation of concerns
- **Reactive Forms**: Form validation and handling
- **Custom CSS**: Tailwind-inspired utility classes

### Security Considerations
- **Password Hashing**: Bcrypt with appropriate salt rounds
- **Input Validation**: Class-validator decorators
- **SQL Injection Protection**: TypeORM query builder
- **XSS Protection**: Angular's built-in sanitization
- **CORS Configuration**: Restricted to frontend origin

## Future Enhancements

### Security Improvements
- JWT refresh token implementation
- Rate limiting and request throttling
- CSRF protection
- Advanced audit logging with IP tracking
- Password complexity requirements

### Scalability Features
- Database connection pooling
- Redis caching for permissions
- Microservices architecture
- Load balancing support
- Database migration system

### User Experience
- Real-time notifications
- Advanced task filtering and search
- Drag-and-drop task management
- Dark mode support
- Mobile-responsive design improvements

### Advanced RBAC
- Custom permission sets
- Role delegation
- Time-based access controls
- Resource-level permissions
- Multi-tenant support

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Run tasks

To run tasks with Nx use:

```sh
npx nx <target> <project-name>
```

For example:

```sh
npx nx build myproject
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

To install a new plugin you can use the `nx add` command. Here's an example of adding the React plugin:
```sh
npx nx add @nx/react
```

Use the plugin's generator to create new projects. For example, to create a new React app or library:

```sh
# Generate an app
npx nx g @nx/react:app demo

# Generate a library
npx nx g @nx/react:lib some-lib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/intro#learn-nx?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
