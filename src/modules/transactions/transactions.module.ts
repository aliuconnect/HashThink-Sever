import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { TransactionsService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { RedisModule } from "../redis/redis.module";
import { WebSocketModule } from "../websocket/websocket.module";
import { ReceiversModule } from "../receivers/receivers.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    RedisModule,
    WebSocketModule,
    ReceiversModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
