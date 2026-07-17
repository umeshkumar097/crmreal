import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const host = this.configService.get<string>('redis.host', 'localhost');
    const port = this.configService.get<number>('redis.port', 6379);
    const password = this.configService.get<string>('redis.password');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 3000);
        this.logger.warn(`Redis connection retry #${times} in ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.client.on('connect', () => this.logger.log('Redis connected'));
    this.client.on('ready', () => this.logger.log('Redis ready'));
    this.client.on('error', (err: Error) => this.logger.error(`Redis error: ${err.message}`, err.stack));
    this.client.on('close', () => this.logger.warn('Redis connection closed'));
    this.client.on('reconnecting', () => this.logger.warn('Redis reconnecting...'));
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Disconnecting from Redis...');
    await this.client.quit();
    this.logger.log('Redis disconnected');
  }

  async get<T = string>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds !== undefined) {
      await this.client.setex(key, ttlSeconds, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    return this.client.exists(...keys);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async hget<T = string>(hash: string, field: string): Promise<T | null> {
    const value = await this.client.hget(hash, field);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async hset(hash: string, field: string, value: unknown): Promise<number> {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    return this.client.hset(hash, field, serialized);
  }

  async hgetall<T = Record<string, string>>(hash: string): Promise<T | null> {
    const result = await this.client.hgetall(hash);
    if (!result || Object.keys(result).length === 0) return null;
    return result as unknown as T;
  }

  async hdel(hash: string, ...fields: string[]): Promise<number> {
    return this.client.hdel(hash, ...fields);
  }

  async lpush(key: string, ...values: unknown[]): Promise<number> {
    const serialized = values.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
    return this.client.lpush(key, ...serialized);
  }

  async rpush(key: string, ...values: unknown[]): Promise<number> {
    const serialized = values.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)));
    return this.client.rpush(key, ...serialized);
  }

  async lrange<T = string>(key: string, start: number, stop: number): Promise<T[]> {
    const values = await this.client.lrange(key, start, stop);
    return values.map((v) => {
      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    });
  }

  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async sismember(key: string, member: string): Promise<number> {
    return this.client.sismember(key, member);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return this.client.incrby(key, increment);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async flushPattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern);
    if (keys.length > 0) {
      await this.del(...keys);
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
