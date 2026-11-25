import { Controller, Get, Patch, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
@Controller('/users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  //------------------ GET all users ------------------//
  @Get()
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.UsersService.findAll();
  }

  //------------------ GET user by id ------------------//
  @Get(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findOne(id: string) {
    return this.UsersService.findByUserPk(id);
  }

  //------------------ GET user role by id ------------------//
  @Get(':id/role')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  findRole(id: string) {
    return this.UsersService.findRoleByUserPk(id);
  }

  //------------------  UPDATE user by id ------------------//
  @Patch(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  updateUser(id: string, updateUserDto: any) {
    return this.UsersService.updateUser(id, updateUserDto);
  }

  //------------------  UPDATE user password by id ------------------//
  @Patch(':id/password')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  updatePassword(id: string, newPassword: string) {
    return this.UsersService.updatePassword(id, newPassword);
  }

  //------------------  DELETE user by id ------------------//
  @Delete(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(id: string) {
    return this.UsersService.deleteUser(id);
  }
}
