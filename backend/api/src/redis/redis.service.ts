import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD', undefined);

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      lazyConnect: true,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    this.client.connect().catch((err) => {
      console.warn(`[RedisService] No se pudo conectar a Redis (${host}:${port}): ${err.message}. Operando con fallback.`);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch (e) {
      // Non-blocking in case of Redis temporary unavailability
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (e) {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (e) {}
  }

  async sadd(key: string, member: string): Promise<void> {
    try {
      await this.client.sadd(key, member);
    } catch (e) {}
  }

  async srem(key: string, member: string): Promise<void> {
    try {
      await this.client.srem(key, member);
    } catch (e) {}
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (e) {
      return [];
    }
  }

  // Helper para blacklist de tokens
  async blacklistToken(tokenHash: string, ttlSeconds: number): Promise<void> {
    await this.set(`blacklist:${tokenHash}`, 'revoked', ttlSeconds);
  }

  async isTokenBlacklisted(tokenHash: string): Promise<boolean> {
    const res = await this.get(`blacklist:${tokenHash}`);
    return res === 'revoked';
  }
}
