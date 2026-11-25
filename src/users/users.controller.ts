import {
  Controller,
  Get,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUser } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('/users')
@UseGuards(JwtAuthGuard, RolesGuard)
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
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUser,
    @Req() request: { user?: { sub?: string } },
  ) {
    // Kontrollér at brugeren er logget ind og har adgang til at opdatere denne profil
    const userPk = request.user?.sub;

    if (!userPk) {
      throw new ForbiddenException('Bruger ikke identificeret');
    }

    if (userPk !== id) {
      const role = await this.UsersService.findRoleByUserPk(userPk);

      if (role !== 'admin') {
        throw new ForbiddenException(
          'Du har ikke adgang til at opdatere denne profil',
        );
      }
    }
    return this.UsersService.updateUser(id, updateUserDto);
  }

  //------------------  UPDATE user password by id ------------------//
  @Patch(':id/password')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
    @Req() request: { user?: { sub?: string } },
  ) {
    if (request.user?.sub !== id) {
      throw new ForbiddenException('Du kan kun ændre din egen adgangskode');
    }

    return this.UsersService.updatePassword(id, dto.newPassword);
  }

  //------------------  DELETE user by id ------------------//
  @Delete(':id')
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(id: string) {
    return this.UsersService.deleteUser(id);
  }
}
