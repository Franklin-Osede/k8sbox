import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MetricsService } from '../../infrastructure/external/metrics.service';

/**
 * Controller: MetricsController
 * Prometheus metrics endpoint
 */
@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(): Promise<string> {
    // Update system metrics
    const memoryUsage = process.memoryUsage();
    this.metricsService.updateMemoryUsage(memoryUsage.heapUsed);

    // Get CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    const totalCpu = cpuUsage.user + cpuUsage.system;
    this.metricsService.updateCpuUsage(totalCpu / 1000000); // Convert to percentage approximation

    return this.metricsService.getMetrics();
  }
}

