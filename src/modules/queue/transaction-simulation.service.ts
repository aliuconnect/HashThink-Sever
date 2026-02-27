import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { TransactionsService } from "../transactions/transactions.service";
import { ReceiversService } from "../receivers/receivers.service";
import { CurrencyEnum } from "../../common/enums/currency.enum";
import { v4 as uuidv4 } from "uuid";

const PAYMENT_METHODS = ["Bank Transfer", "Card", "Wallet", "UPI", "Cash"];
const INTERVAL_MS = 7000; // 5–10 seconds

@Injectable()
export class TransactionSimulationService
  implements OnModuleInit, OnModuleDestroy
{
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly receiversService: ReceiversService,
  ) {}

  onModuleInit(): void {
    this.intervalId = setInterval(() => this.tick(), INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async tick(): Promise<void> {
    try {
      const receivers = await this.receiversService.findAll();
      if (receivers.length === 0) return;

      const receiver = receivers[Math.floor(Math.random() * receivers.length)];
      const currencies = [CurrencyEnum.USD, CurrencyEnum.IRR, CurrencyEnum.INR];
      const currency =
        currencies[Math.floor(Math.random() * currencies.length)];
      const amount = Number((Math.random() * 1000 + 10).toFixed(2));
      const ref = `SIM-${Date.now()}-${uuidv4().slice(0, 8)}`;

      await this.transactionsService.create({
        referenceNumber: ref,
        receiverId: receiver.id,
        to: receiver.email,
        amount,
        currency,
        paymentMethod:
          PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
      });
    } catch (err) {
      // Ignore (e.g. no receivers or DB error)
      throw new Error(err);
    }
  }
}
