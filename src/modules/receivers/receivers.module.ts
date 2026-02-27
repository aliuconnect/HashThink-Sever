import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Receiver } from "./entities/receiver.entity";
import { ReceiversService } from "./receivers.service";
import { ReceiversController } from "./receivers.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Receiver])],
  controllers: [ReceiversController],
  providers: [ReceiversService],
  exports: [ReceiversService],
})
export class ReceiversModule {}
