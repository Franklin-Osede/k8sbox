import { Controller, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppLoggerService } from '../../infrastructure/external/logger.service';
import { KubernetesCRDService } from '../../infrastructure/external/kubernetes-crd.service';
import { ReconciliationDomainService } from '../../domain/domain-services/reconciliation.service';
import { CustomResourceEntity } from '../../domain/entities/custom-resource-entity';

/**
 * Controller: OperatorController
 * Kubernetes Operator controller that watches and reconciles custom resources
 */
@Controller('operator')
@Injectable()
export class OperatorController implements OnModuleInit, OnModuleDestroy {
  private watchInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly logger: AppLoggerService,
    private readonly crdService: KubernetesCRDService,
    private readonly reconciliationService: ReconciliationDomainService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    this.logger.log('Operator controller initialized', 'OperatorController');
    // Start watching for custom resources
    this.startWatching();
  }

  async onModuleDestroy() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }
    this.logger.log('Operator controller stopped', 'OperatorController');
  }

  /**
   * Periodic reconciliation (runs every minute)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async reconcileAllResources() {
    try {
      this.logger.debug('Starting periodic reconciliation', 'OperatorController');

      const resources = await this.crdService.listCustomResources();
      const resourcesToReconcile = resources.filter((r) => r.needsReconciliation());

      this.logger.log(
        `Found ${resourcesToReconcile.length} resources needing reconciliation`,
        'OperatorController',
      );

      for (const resource of resourcesToReconcile) {
        try {
          await this.reconciliationService.reconcile(resource);
        } catch (error) {
          this.logger.error(
            `Failed to reconcile ${resource.name}: ${error.message}`,
            error.stack,
            'OperatorController',
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error during periodic reconciliation: ${error.message}`,
        error.stack,
        'OperatorController',
      );
    }
  }

  /**
   * Start watching for custom resources (simplified polling approach)
   */
  private startWatching() {
    this.logger.log('Starting resource watcher', 'OperatorController');
    // In a production operator, you would use Kubernetes watch API
    // For this implementation, we use periodic reconciliation via cron
  }
}

