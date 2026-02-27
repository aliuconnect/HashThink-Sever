import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Transaction } from "../transactions/entities/transaction.entity";

@WebSocketGateway({
  cors: { origin: "*" },
  namespace: "/transactions",
})
export class TransactionsGateway {
  @WebSocketServer()
  server: Server;

  emitTransactionCreated(transaction: Transaction): void {
    this.server?.emit("transaction.created", transaction);
  }

  emitTransactionUpdated(transaction: Transaction): void {
    this.server?.emit("transaction.updated", transaction);
  }
}
