import { Module } from "@nestjs/common";
import { TransactionSimulationService } from "./transaction-simulation.service";
import { TransactionsModule } from "../transactions/transactions.module";
import { ReceiversModule } from "../receivers/receivers.module";

@Module({
  imports: [TransactionsModule, ReceiversModule],
  providers: [TransactionSimulationService],
})
export class QueueModule {}
