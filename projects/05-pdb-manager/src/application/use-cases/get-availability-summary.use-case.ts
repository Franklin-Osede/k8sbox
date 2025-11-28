import { Injectable } from '@nestjs/common';
import { AvailabilityDomainService } from '../../domain/domain-services/availability.service';

/**
 * Use Case: GetAvailabilitySummaryUseCase
 * Application layer use case for getting availability summary
 */
@Injectable()
export class GetAvailabilitySummaryUseCase {
  constructor(private readonly availabilityDomainService: AvailabilityDomainService) {}

  async execute(namespace: string): Promise<{
    totalPDBs: number;
    healthyPDBs: number;
    violatedPDBs: number;
    averageAvailability: number;
  }> {
    return this.availabilityDomainService.getAvailabilitySummary(namespace);
  }
}

