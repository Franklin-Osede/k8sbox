import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { SecretKeyVO } from '../../domain/value-objects/secret-key.vo';
import { AppLoggerService } from './logger.service';

/**
 * Infrastructure Service: KubernetesSecretService
 * Handles interaction with Kubernetes Secrets API
 */
@Injectable()
export class KubernetesSecretService {
  private k8sApi: k8s.CoreV1Api;

  constructor(private readonly logger: AppLoggerService) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  }

  /**
   * Get a secret from Kubernetes
   */
  async getSecret(secretKey: SecretKeyVO): Promise<k8s.V1Secret | null> {
    try {
      const response = await this.k8sApi.readNamespacedSecret(
        secretKey.name,
        secretKey.namespace,
      );
      return response.body;
    } catch (error) {
      if (error.statusCode === 404) {
        this.logger.warn(`Secret ${secretKey.toString()} not found`, 'KubernetesSecretService');
        return null;
      }
      this.logger.error(
        `Failed to get secret ${secretKey.toString()}: ${error.message}`,
        error.stack,
        'KubernetesSecretService',
      );
      throw error;
    }
  }

  /**
   * Create or update a secret in Kubernetes
   */
  async createOrUpdateSecret(
    secretKey: SecretKeyVO,
    data: Record<string, string>,
  ): Promise<k8s.V1Secret> {
    try {
      // Try to get existing secret
      const existing = await this.getSecret(secretKey);

      const secret: k8s.V1Secret = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: secretKey.name,
          namespace: secretKey.namespace,
        },
        type: 'Opaque',
        data: this.encodeData(data),
      };

      if (existing) {
        // Update existing secret
        const response = await this.k8sApi.replaceNamespacedSecret(
          secretKey.name,
          secretKey.namespace,
          secret,
        );
        this.logger.log(`Secret ${secretKey.toString()} updated`, 'KubernetesSecretService');
        return response.body;
      } else {
        // Create new secret
        const response = await this.k8sApi.createNamespacedSecret(secretKey.namespace, secret);
        this.logger.log(`Secret ${secretKey.toString()} created`, 'KubernetesSecretService');
        return response.body;
      }
    } catch (error) {
      this.logger.error(
        `Failed to create/update secret ${secretKey.toString()}: ${error.message}`,
        error.stack,
        'KubernetesSecretService',
      );
      throw error;
    }
  }

  /**
   * Rotate secret by generating new values
   */
  async rotateSecret(secretKey: SecretKeyVO): Promise<Record<string, string>> {
    try {
      const existing = await this.getSecret(secretKey);
      const currentData = existing ? this.decodeData(existing.data || {}) : {};

      // Generate new values for all keys
      const newData: Record<string, string> = {};
      for (const key of Object.keys(currentData)) {
        newData[key] = this.generateSecretValue();
      }

      // If no existing secret, create default keys
      if (Object.keys(newData).length === 0) {
        newData['password'] = this.generateSecretValue();
        newData['token'] = this.generateSecretValue();
      }

      await this.createOrUpdateSecret(secretKey, newData);

      return newData;
    } catch (error) {
      this.logger.error(
        `Failed to rotate secret ${secretKey.toString()}: ${error.message}`,
        error.stack,
        'KubernetesSecretService',
      );
      throw error;
    }
  }

  /**
   * Generate a random secret value
   */
  private generateSecretValue(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Encode data to base64 for Kubernetes Secret
   */
  private encodeData(data: Record<string, string>): Record<string, string> {
    const encoded: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      encoded[key] = Buffer.from(value).toString('base64');
    }
    return encoded;
  }

  /**
   * Decode base64 data from Kubernetes Secret
   */
  private decodeData(data: Record<string, string>): Record<string, string> {
    const decoded: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      decoded[key] = Buffer.from(value, 'base64').toString('utf-8');
    }
    return decoded;
  }
}

