import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginDto, AuthResponse, Role } from '@turbo-vets-task-manager/data';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login user and store token', () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResponse: AuthResponse = {
        access_token: 'jwt-token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: Role.VIEWER,
          organizationId: 'org1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      service.login(loginDto).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('access_token')).toBe('jwt-token');
        expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockResponse.user));
      });

      const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginDto);
      req.flush(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear stored data', () => {
      localStorage.setItem('access_token', 'token');
      localStorage.setItem('current_user', 'user');

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('access_token', 'token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true for correct role', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.ADMIN,
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('current_user', JSON.stringify(user));
      service['currentUserSubject'].next(user);

      expect(service.hasRole('admin')).toBe(true);
    });

    it('should return false for incorrect role', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.VIEWER,
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('current_user', JSON.stringify(user));
      service['currentUserSubject'].next(user);

      expect(service.hasRole('admin')).toBe(false);
    });
  });

  describe('canAccess', () => {
    it('should return true for owner role', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.OWNER,
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('current_user', JSON.stringify(user));
      service['currentUserSubject'].next(user);

      expect(service.canAccess('task', 'create')).toBe(true);
      expect(service.canAccess('user', 'delete')).toBe(true);
    });

    it('should return appropriate permissions for admin role', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.ADMIN,
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('current_user', JSON.stringify(user));
      service['currentUserSubject'].next(user);

      expect(service.canAccess('task', 'create')).toBe(true);
      expect(service.canAccess('user', 'create')).toBe(true);
      expect(service.canAccess('user', 'delete')).toBe(true);
    });

    it('should return limited permissions for viewer role', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.VIEWER,
        organizationId: 'org1',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('current_user', JSON.stringify(user));
      service['currentUserSubject'].next(user);

      expect(service.canAccess('task', 'read')).toBe(true);
      expect(service.canAccess('task', 'create')).toBe(false);
      expect(service.canAccess('user', 'delete')).toBe(false);
    });
  });
});
