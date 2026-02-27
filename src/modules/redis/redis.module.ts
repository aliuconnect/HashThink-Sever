import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { REDIS_CLIENT } from "./redis.constants";
import { RedisService } from "./redis.service";

const redisLogger = new Logger("Redis");

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => {
        const host = config.get<string>("redis.host", "localhost");
        const port = config.get<number>("redis.port", 6379);
        const password = config.get<string>("redis.password");
        const useTls = config.get<boolean>("redis.tls", false);
        const client = new Redis({
          host,
          port,
          ...(password && { password }),
          ...(useTls && { tls: {} }),
          retryStrategy: (times) => (times < 5 ? 2000 : null),
        });
        client.on("error", (err) =>
          redisLogger.warn(
            `Redis connection: ${err?.message || "connection failed"}`,
          ),
        );
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
