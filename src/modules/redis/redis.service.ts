import { Injectable, Inject } from "@nestjs/common";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";

const CACHE_TTL = 60; // seconds

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private async safe<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch {
      return null;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.safe(() => this.redis.get(key));
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds = CACHE_TTL,
  ): Promise<void> {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    await this.safe(() => this.redis.setex(key, ttlSeconds, serialized));
  }

  async del(key: string): Promise<void> {
    await this.safe(() => this.redis.del(key));
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.safe(() => this.redis.keys(pattern));
    if (keys && keys.length > 0) {
      await this.safe(() => this.redis.del(...keys));
    }
  }

  async invalidateTransactionsCache(): Promise<void> {
    await this.delPattern("transactions:*");
  }
}
