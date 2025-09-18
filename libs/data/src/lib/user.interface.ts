export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  VIEWER = 'viewer'
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}
