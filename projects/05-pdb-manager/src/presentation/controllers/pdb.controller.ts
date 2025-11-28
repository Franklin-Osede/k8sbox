import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreatePDBUseCase } from '../../application/use-cases/create-pdb.use-case';
import { GetPDBStatusUseCase } from '../../application/use-cases/get-pdb-status.use-case';
import { ListPDBsUseCase } from '../../application/use-cases/list-pdbs.use-case';
import { GetAvailabilitySummaryUseCase } from '../../application/use-cases/get-availability-summary.use-case';
import { KubernetesPDBService } from '../../infrastructure/external/kubernetes-pdb.service';
import { CreatePDBDto, PDBStatusDto, AvailabilitySummaryDto } from '../dto/pdb.dto';
import { PDBEntity } from '../../domain/entities/pdb-entity';
import { AvailabilityLevelVO } from '../../domain/value-objects/availability-level.vo';

/**
 * Controller: PDBController
 * Presentation layer controller for PDB endpoints
 */
@ApiTags('pdb')
@Controller('pdb')
export class PDBController {
  constructor(
    private readonly createPDBUseCase: CreatePDBUseCase,
    private readonly getPDBStatusUseCase: GetPDBStatusUseCase,
    private readonly listPDBsUseCase: ListPDBsUseCase,
    private readonly getAvailabilitySummaryUseCase: GetAvailabilitySummaryUseCase,
    private readonly kubernetesPDBService: KubernetesPDBService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create or update Pod Disruption Budget' })
  @ApiResponse({ status: 201, description: 'PDB created successfully', type: PDBStatusDto })
  async createPDB(@Body() createPDBDto: CreatePDBDto): Promise<PDBStatusDto> {
    const availabilityLevel =
      createPDBDto.availabilityType === 'minAvailable'
        ? AvailabilityLevelVO.minAvailable(createPDBDto.availabilityValue)
        : AvailabilityLevelVO.maxUnavailable(createPDBDto.availabilityValue);

    const pdb = PDBEntity.create(
      createPDBDto.name,
      createPDBDto.namespace,
      availabilityLevel,
      createPDBDto.selector,
    );

    const createdPDB = await this.createPDBUseCase.execute(pdb);
    return this.mapToDto(createdPDB);
  }

  @Get(':name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get PDB status' })
  @ApiParam({ name: 'name', description: 'PDB name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'PDB status', type: PDBStatusDto })
  @ApiResponse({ status: 404, description: 'PDB not found' })
  async getPDBStatus(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<PDBStatusDto> {
    const pdb = await this.getPDBStatusUseCase.execute(name, namespace);
    if (!pdb) {
      throw new NotFoundException(`PDB ${name} not found in namespace ${namespace}`);
    }
    return this.mapToDto(pdb);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all PDBs in namespace' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'List of PDBs', type: [PDBStatusDto] })
  async listPDBs(@Query('namespace') namespace: string = 'default'): Promise<PDBStatusDto[]> {
    const pdbs = await this.listPDBsUseCase.execute(namespace);
    return pdbs.map((pdb) => this.mapToDto(pdb));
  }

  @Get('summary/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get availability summary for namespace' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 200, description: 'Availability summary', type: AvailabilitySummaryDto })
  async getAvailabilitySummary(
    @Query('namespace') namespace: string = 'default',
  ): Promise<AvailabilitySummaryDto> {
    return this.getAvailabilitySummaryUseCase.execute(namespace);
  }

  @Delete(':name')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete PDB' })
  @ApiParam({ name: 'name', description: 'PDB name' })
  @ApiQuery({ name: 'namespace', required: false, description: 'Namespace (default: default)' })
  @ApiResponse({ status: 204, description: 'PDB deleted successfully' })
  @ApiResponse({ status: 404, description: 'PDB not found' })
  async deletePDB(
    @Param('name') name: string,
    @Query('namespace') namespace: string = 'default',
  ): Promise<void> {
    await this.kubernetesPDBService.deletePDB(name, namespace);
  }

  private mapToDto(pdb: PDBEntity): PDBStatusDto {
    return {
      name: pdb.name,
      namespace: pdb.namespace,
      status: pdb.status?.status || 'pending',
      currentHealthy: pdb.status?.currentHealthy || 0,
      desiredHealthy: pdb.status?.desiredHealthy || 0,
      disruptedPods: pdb.status?.disruptedPods || 0,
      allowedDisruptions: pdb.status?.allowedDisruptions || 0,
      availabilityPercentage: pdb.getAvailabilityPercentage(),
      isHealthy: pdb.isHealthy(),
      isViolated: pdb.isViolated(),
    };
  }
}

