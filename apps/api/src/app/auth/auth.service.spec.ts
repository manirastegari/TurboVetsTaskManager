import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { LoginDto, CreateUserDto, Role } from '@turbo-vets-task-manager/data';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'Test',
    lastName: 'User',
    role: Role.VIEWER,
    organizationId: 'org1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(loginDto.email, loginDto.password);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: Role.VIEWER,
        organizationId: 'org1',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result.password).toBeUndefined();
    });

    it('should return null when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user when login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;

      jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: userWithoutPassword,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'test@example.com',
        role: Role.VIEWER,
        organizationId: 'org1',
      });
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should create new user and return access token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: Role.VIEWER,
        organizationId: 'org1',
      };

      const hashedPassword = 'hashedPassword';
      const newUser = { ...mockUser, ...createUserDto, password: hashedPassword };
      const userWithoutPassword = { ...newUser };
      delete userWithoutPassword.password;

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: userWithoutPassword,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
    });

    it('should throw UnauthorizedException when user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
        role: Role.VIEWER,
        organizationId: 'org1',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.register(createUserDto)).rejects.toThrow('User already exists');
    });
  });
});
