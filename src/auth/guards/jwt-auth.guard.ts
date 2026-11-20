import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { sub: string };
    }>();

    const token =
      request.headers.authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!token) {
      throw new UnauthorizedException('Du skal være logget ind');
    }

    let payload: { sub?: string };

    try {
      payload = await this.jwtService.verifyAsync<{ sub?: string }>(token);
    } catch {
      throw new UnauthorizedException('Dit token er ugyldigt eller udløbet');
    }

    if (typeof payload?.sub !== 'string' || !payload.sub) {
      throw new UnauthorizedException('Tokenet mangler et bruger-id');
    }

    request.user = { sub: payload.sub };
    return true;
  }
}
