import {CanActivate, ExecutionContext, Injectable, UnauthorizedException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {

  // tilføj JwtService for at kunne verificere JWT tokens
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  // tjek om request indeholder et gyldigt JWT token i Authorization header
  async canActivate(context: ExecutionContext): Promise<boolean> {

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { sub: string };
    }>();

    // definér token fra Authorization header (Bearer token)
    const token = request.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

      // throw exception if no token is provided (bruger er ikke logget ind)
    if (!token) {
      throw new UnauthorizedException('Du skal være logget ind');
    }

    let payload: { sub?: string };

    // verify token er gyldig (bruger-id)
    try {
      payload = await this.jwtService.verifyAsync<{ sub?: string }>(token);
    } catch {
      throw new UnauthorizedException('Dit token er ugyldigt eller udløbet');
    }

    // throw exception hvis token ikke indeholder user id
    if (typeof payload?.sub !== 'string' || !payload.sub) {
      throw new UnauthorizedException('Tokenet mangler et bruger-id');
    }

    // tilføj bruger-id til request objektet, så det kan bruges i controlleren
    request.user = { sub: payload.sub };
    return true;
  }
}
