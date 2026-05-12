import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from './auth/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'reward-system-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
