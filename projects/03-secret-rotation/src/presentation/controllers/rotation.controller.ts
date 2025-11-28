import { Controller, Post, Get, Param, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RotateSecretUseCase } from '../../application/use-cases/rotate-secret.use-case';
import { GetRotationStatusUseCase } from '../../application/use-cases/get-rotation-status.use-case';
import { RotateAllDueUseCase } from '../../application/use-cases/rotate-all-due.use-case';
import { SecretRotationDomainService } from '../../domain/domain-services/secret-rotation.service';
import { RotationResponseDto, RotateAllResponseDto, RotationStatusDto } from '../dto/rotation-response.dto';

/**
 * Controller: RotationController
 * Presentation layer controller for secret rotation endpoints
 */
@ApiTags('rotation')
@Controller('rotation')
export class RotationController {
  constructor(
    private readonly rotateSecretUseCase: RotateSecretUseCase,
    private readonly getRotationStatusUseCase: GetRotationStatusUseCase,
    private readonly rotateAllDueUseCase: RotateAllDueUseCase,
    private readonly rotationDomainService: SecretRotationDomainService,
  ) {}

  @Post('secret/:namespace/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate a specific secret' })
  @ApiParam({ name: 'namespace', description: 'Kubernetes namespace' })
  @ApiParam({ name: 'name', description: 'Secret name' })
  @ApiResponse({ status: 200, description: 'Secret rotated successfully', type: RotationResponseDto })
  async rotateSecret(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ): Promise<RotationResponseDto> {
    try {
      const rotation = await this.rotateSecretUseCase.execute(name, namespace);

      return {
        success: true,
        message: 'Secret rotated successfully',
        rotation: this.toDto(rotation),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to rotate secret: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('secret/:namespace/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get rotation status for a secret' })
  @ApiParam({ name: 'namespace', description: 'Kubernetes namespace' })
  @ApiParam({ name: 'name', description: 'Secret name' })
  @ApiResponse({ status: 200, description: 'Rotation status', type: RotationResponseDto })
  async getStatus(
    @Param('namespace') namespace: string,
    @Param('name') name: string,
  ): Promise<RotationResponseDto> {
    const rotation = this.getRotationStatusUseCase.execute(name, namespace);

    if (!rotation) {
      throw new HttpException(
        {
          success: false,
          message: 'Secret not registered for rotation',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      message: 'Rotation status retrieved',
      rotation: this.toDto(rotation),
    };
  }

  @Post('rotate-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate all secrets that are due' })
  @ApiResponse({ status: 200, description: 'Rotation results', type: RotateAllResponseDto })
  async rotateAllDue(): Promise<RotateAllResponseDto> {
    const results = await this.rotateAllDueUseCase.execute();

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return {
      totalDue: results.length,
      successful,
      failed,
      results: results.map((r) => this.toDto(r.secret)),
    };
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get status of all registered rotations' })
  @ApiResponse({ status: 200, description: 'All rotation statuses', type: [RotationStatusDto] })
  async getAllStatus(): Promise<RotationStatusDto[]> {
    const rotations = this.rotationDomainService.getAllRotations();
    return rotations.map((r) => this.toDto(r));
  }

  private toDto(rotation: any): RotationStatusDto {
    return {
      secretName: rotation.secretKey.name,
      namespace: rotation.secretKey.namespace,
      status: rotation.status.status,
      message: rotation.status.message,
      rotationCount: rotation.rotationCount,
      lastRotationTime: rotation.lastRotationTime?.toISOString(),
      nextRotationTime: rotation.nextRotationTime?.toISOString(),
      isHealthy: rotation.isHealthy(),
    };
  }
}

