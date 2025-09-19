import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { CreateOrganizationDto } from '@turbo-vets-task-manager/data';
import { RBACService } from '@turbo-vets-task-manager/auth';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async findAll(user: User): Promise<Organization[]> {
    // Get organizations based on user's role
    const query = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.parent', 'parent')
      .leftJoinAndSelect('organization.children', 'children');

    // Viewers can only see their own organization
    if (user.role === 'viewer') {
      query.where('organization.id = :organizationId', { organizationId: user.organizationId });
    } else {
      // Owners and Admins can see their organization and its children
      query.where('organization.id = :organizationId OR organization.parentId = :organizationId', 
        { organizationId: user.organizationId });
    }

    return query.getMany();
  }

  async findOne(id: string, user: User): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'users'],
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user can access this organization
    if (!RBACService.canAccessResource(user.role, user.organizationId, organization.id)) {
      throw new ForbiddenException('Access denied');
    }

    return organization;
  }

  async create(createOrganizationDto: CreateOrganizationDto, user: User): Promise<Organization> {
    // Check if user can create organizations
    if (!RBACService.hasPermission(user.role, 'organization', 'create')) {
      throw new ForbiddenException('Insufficient permissions to create organizations');
    }

    // If parentId is provided, check if user can access the parent organization
    if (createOrganizationDto.parentId) {
      const parentOrg = await this.organizationRepository.findOne({
        where: { id: createOrganizationDto.parentId }
      });

      if (!parentOrg) {
        throw new NotFoundException('Parent organization not found');
      }

      if (!RBACService.canAccessResource(user.role, user.organizationId, parentOrg.id)) {
        throw new ForbiddenException('Cannot create organization under this parent');
      }
    }

    const organization = this.organizationRepository.create(createOrganizationDto);
    return this.organizationRepository.save(organization);
  }

  async update(id: string, updateData: Partial<CreateOrganizationDto>, user: User): Promise<Organization> {
    const organization = await this.findOne(id, user);

    // Check if user can update organizations
    if (!RBACService.hasPermission(user.role, 'organization', 'update')) {
      throw new ForbiddenException('Insufficient permissions to update organizations');
    }

    Object.assign(organization, updateData);
    return this.organizationRepository.save(organization);
  }

  async remove(id: string, user: User): Promise<void> {
    const organization = await this.findOne(id, user);

    // Check if user can delete organizations
    if (!RBACService.hasPermission(user.role, 'organization', 'delete')) {
      throw new ForbiddenException('Insufficient permissions to delete organizations');
    }

    // Check if organization has users
    const userCount = await this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoin('organization.users', 'user')
      .where('organization.id = :id', { id })
      .getCount();

    if (userCount > 0) {
      throw new ForbiddenException('Cannot delete organization with existing users');
    }

    await this.organizationRepository.remove(organization);
  }
}
