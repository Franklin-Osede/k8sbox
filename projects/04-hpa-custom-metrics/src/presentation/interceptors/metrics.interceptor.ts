import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusMetricsService } from '../../infrastructure/external/prometheus-metrics.service';

/**
 * Interceptor: MetricsInterceptor
 * Automatically records metrics for all HTTP requests
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: PrometheusMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const route = request.route?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - startTime) / 1000;
          const status = response.statusCode;

          // Record metrics
          this.metricsService.incrementRequest(method, route, status);
          this.metricsService.recordRequestDuration(method, route, duration);
        },
        error: () => {
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.incrementRequest(method, route, 500);
          this.metricsService.recordRequestDuration(method, route, duration);
        },
      }),
    );
  }
}

