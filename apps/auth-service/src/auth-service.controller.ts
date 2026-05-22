import { Controller } from '@nestjs/common';
import { AuthServiceService } from './auth-service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthServiceService) {}

  @MessagePattern('auth.register')
  async register(@Payload() data: any) {
    return this.authService.register(data);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: any) {
    return this.authService.login(data);
  }

  @MessagePattern('auth.verifyToken')
  async verifyToken(@Payload() data: any) {
    return this.authService.verifyToken(data);
  }
}
