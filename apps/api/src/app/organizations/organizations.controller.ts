import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from '@turbo-vets-task-manager/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RBACGuard } from '../auth/rbac.guard';
import { RBAC } from '../auth/rbac.decorator';
import { User } from '../entities/user.entity';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RBACGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @RBAC('organization', 'create')
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Request() req: { user: User }) {
    return this.organizationsService.create(createOrganizationDto, req.user);
  }

  @Get()
  @RBAC('organization', 'read')
  findAll(@Request() req: { user: User }) {
    return this.organizationsService.findAll(req.user);
  }

  @Get(':id')
  @RBAC('organization', 'read')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.organizationsService.findOne(id, req.user);
  }

  @Patch(':id')
  @RBAC('organization', 'update')
  update(
    @Param('id') id: string, 
    @Body() updateOrganizationDto: Partial<CreateOrganizationDto>, 
    @Request() req: { user: User }
  ) {
    return this.organizationsService.update(id, updateOrganizationDto, req.user);
  }

  @Delete(':id')
  @RBAC('organization', 'delete')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.organizationsService.remove(id, req.user);
  }
}
