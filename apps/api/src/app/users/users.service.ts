import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { CreateUserDto, Role } from '@turbo-vets-task-manager/data';
import { RBACService } from '@turbo-vets-task-manager/auth';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async findAll(user: User): Promise<User[]> {
    // Get users based on user's role and organization
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.organizationId = :organizationId', { organizationId: user.organizationId });

    // Viewers can only see themselves
    if (user.role === Role.VIEWER) {
      query.andWhere('user.id = :userId', { userId: user.id });
    }

    return query.getMany();
  }

  async findOne(id: string, user: User): Promise<User> {
    const targetUser = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if user can access this user
    if (!RBACService.canAccessResource(user.role, user.organizationId, targetUser.organizationId)) {
      throw new ForbiddenException('Access denied');
    }

    // Additional check for viewers
    if (user.role === Role.VIEWER && targetUser.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return targetUser;
  }

  async create(createUserDto: CreateUserDto, user: User): Promise<User> {
    // Check if user can create users
    if (!RBACService.hasPermission(user.role, 'user', 'create')) {
      throw new ForbiddenException('Insufficient permissions to create users');
    }

    // Check if the target organization is accessible
    const organization = await this.organizationRepository.findOne({
      where: { id: createUserDto.organizationId }
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (!RBACService.canAccessResource(user.role, user.organizationId, createUserDto.organizationId)) {
      throw new ForbiddenException('Cannot create users in this organization');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ForbiddenException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async update(id: string, updateData: Partial<CreateUserDto>, user: User): Promise<User> {
    const targetUser = await this.findOne(id, user);

    // Check if user can update users
    if (!RBACService.hasPermission(user.role, 'user', 'update')) {
      throw new ForbiddenException('Insufficient permissions to update users');
    }

    // Additional check for admins - they can only update users in their organization
    if (user.role === Role.ADMIN && targetUser.organizationId !== user.organizationId) {
      throw new ForbiddenException('Can only update users in your organization');
    }

    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    Object.assign(targetUser, updateData);
    return this.userRepository.save(targetUser);
  }

  async remove(id: string, user: User): Promise<void> {
    const targetUser = await this.findOne(id, user);

    // Check if user can delete users
    if (!RBACService.hasPermission(user.role, 'user', 'delete')) {
      throw new ForbiddenException('Insufficient permissions to delete users');
    }

    // Additional check for admins
    if (user.role === Role.ADMIN && targetUser.organizationId !== user.organizationId) {
      throw new ForbiddenException('Can only delete users in your organization');
    }

    // Prevent self-deletion
    if (targetUser.id === user.id) {
      throw new ForbiddenException('Cannot delete your own account');
    }

    await this.userRepository.remove(targetUser);
  }
}
