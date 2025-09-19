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
import { UsersService } from './users.service';
import { CreateUserDto } from '@turbo-vets-task-manager/data';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RBACGuard } from '../auth/rbac.guard';
import { RBAC } from '../auth/rbac.decorator';
import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RBACGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RBAC('user', 'create')
  create(@Body() createUserDto: CreateUserDto, @Request() req: { user: User }) {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @RBAC('user', 'read')
  findAll(@Request() req: { user: User }) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @RBAC('user', 'read')
  findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.usersService.findOne(id, req.user);
  }

  @Patch(':id')
  @RBAC('user', 'update')
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: Partial<CreateUserDto>, 
    @Request() req: { user: User }
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @RBAC('user', 'delete')
  remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.usersService.remove(id, req.user);
  }
}
