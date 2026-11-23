import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException,} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/role.decorator';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {

    // reflector bruges til at hente metadata, der er defineret af decorators.
    // I dette tilfælde bruges den til at hente de roller, der er nødvendige for at få adgang til en bestemt route.
    constructor(
        private reflector: Reflector,
        private usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        // Hent de tilladte roller fra decorator
        const roles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        // Hvis ingen rolle er defineret, gives adgang
        if (!roles) return true;

        // Hent brugerens ID fra JWT
        const request = context.switchToHttp().getRequest();
        const userPk = request.user?.sub;

        if (!userPk) {
            throw new UnauthorizedException('Bruger ikke identificeret');
        }

        // Hent brugerens rolle fra databasen
        const user = await this.usersService.findByUserPk(userPk);

        // Kontrollér om brugeren har den nødvendige rolle
        if (!roles.includes(user.user_role)) {
            throw new ForbiddenException('Du har ikke adgang');
        }

        return true;
    }
}