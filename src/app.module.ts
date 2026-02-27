import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { TerminusModule } from "@nestjs/terminus";
import configuration from "./config/configuration";
import { RedisModule } from "./modules/redis/redis.module";
import { ReceiversModule } from "./modules/receivers/receivers.module";
import { CurrencyModule } from "./modules/currency/currency.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { WebSocketModule } from "./modules/websocket/websocket.module";
import { QueueModule } from "./modules/queue/queue.module";
import { AppController } from "./app.controller";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.get<string>("database.host"),
        port: config.get<number>("database.port"),
        username: config.get<string>("database.username"),
        password: config.get<string>("database.password"),
        database: config.get<string>("database.name"),
        ssl: config.get<boolean>("database.ssl")
          ? { rejectUnauthorized: false }
          : false,
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
        logging: config.get<string>("nodeEnv") === "development",
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TerminusModule,
    RedisModule,
    ReceiversModule,
    CurrencyModule,
    TransactionsModule,
    WebSocketModule,
    QueueModule,
  ],
  controllers: [AppController, HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
