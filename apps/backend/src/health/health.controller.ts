import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'vitera-b2b-backend',
      time: new Date().toISOString()
    };
  }
}
