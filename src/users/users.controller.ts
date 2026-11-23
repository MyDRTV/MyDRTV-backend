import { Controller, Get, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller('/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  //------------------ GET all users ------------------//
  @Get()
  @Roles('admin', 'user')
  findAll() {
    return this.UsersService.findAll();
  }

  //------------------ GET user by id ------------------//
  @Get(':id')
  @Roles('admin', 'user')
  findOne(id: string) {
    return this.UsersService.findByUserPk(id);
  }

  //------------------ GET user role by id ------------------//
  @Get(':id/role')
  @Roles('admin', 'user')
  findRole(id: string) {
    return this.UsersService.findRoleByUserPk(id);
  }

  //------------------  UPDATE user by id ------------------//
  @Patch(':id')
  @Roles('admin', 'user')
  updateUser(id: string, updateUserDto: any) {
    return this.UsersService.updateUser(id, updateUserDto);
  }

  //------------------  UPDATE user password by id ------------------//
  @Patch(':id/password')
  @Roles('admin', 'user')
  updatePassword(id: string, newPassword: string) {
    return this.UsersService.updatePassword(id, newPassword);
  }

  //------------------  DELETE user by id ------------------//
  @Delete(':id')
  @Roles('admin', 'user')
  deleteUser(id: string) {
    return this.UsersService.deleteUser(id);
  }
}
