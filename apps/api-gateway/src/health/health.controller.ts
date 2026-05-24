import { Controller, Get } from '@nestjs/common';
import { PrismaClientService } from '@app/prisma-client';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaClientService) {}

  @Get()
  async check() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'error';
    }

    const memoryUsage = process.memoryUsage();
    const status = dbStatus === 'ok' ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: dbStatus },
        memory: {
          status: 'ok',
          heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      },
    };
  }
}
