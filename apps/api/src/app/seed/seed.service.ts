import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../entities/organization.entity';
import { User } from '../entities/user.entity';
import { Role } from '@turbo-vets-task-manager/data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    // Create organizations
    const parentOrg = this.organizationRepository.create({
      name: 'TurboVets Corp',
    });
    const savedParentOrg = await this.organizationRepository.save(parentOrg);

    const childOrg = this.organizationRepository.create({
      name: 'Engineering Team',
      parentId: savedParentOrg.id,
    });
    const savedChildOrg = await this.organizationRepository.save(childOrg);

    // Create users
    const owner = this.userRepository.create({
      email: 'owner@turbovets.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'John',
      lastName: 'Owner',
      role: Role.OWNER,
      organizationId: savedParentOrg.id,
    });
    await this.userRepository.save(owner);

    const admin = this.userRepository.create({
      email: 'admin@turbovets.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Jane',
      lastName: 'Admin',
      role: Role.ADMIN,
      organizationId: savedChildOrg.id,
    });
    await this.userRepository.save(admin);

    const viewer = this.userRepository.create({
      email: 'viewer@turbovets.com',
      password: await bcrypt.hash('password123', 10),
      firstName: 'Bob',
      lastName: 'Viewer',
      role: Role.VIEWER,
      organizationId: savedChildOrg.id,
    });
    await this.userRepository.save(viewer);

    console.log('Database seeded successfully!');
    console.log('Test users created:');
    console.log('- owner@turbovets.com (Owner)');
    console.log('- admin@turbovets.com (Admin)');
    console.log('- viewer@turbovets.com (Viewer)');
    console.log('Password for all users: password123');
  }
}
