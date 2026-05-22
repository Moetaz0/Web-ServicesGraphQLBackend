import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    
    // Support WebSocket connections context as well
    const connectionParams = ctx.getContext().connectionParams;
    let authHeader = req?.headers?.authorization;
    
    if (!authHeader && connectionParams) {
      authHeader = connectionParams.Authorization || connectionParams.authorization;
    }

    if (!authHeader) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    try {
      const user = await firstValueFrom(this.authClient.send('auth.verifyToken', { token }));
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      
      // Inject user in context
      if (req) {
        req.user = user;
      } else {
        ctx.getContext().user = user;
      }
      
      return true;
    } catch (err) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
