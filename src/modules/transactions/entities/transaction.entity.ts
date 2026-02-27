import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Receiver } from "../../receivers/entities/receiver.entity";
import { CurrencyEnum } from "../../../common/enums/currency.enum";
import { StatusEnum } from "../../../common/enums/status.enum";

@Entity("transactions")
@Index(["currency"])
@Index(["status"])
@Index(["createdAt"])
@Index(["receiverId"])
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "reference_number", unique: true })
  referenceNumber: string;

  @Column({ name: "receiver_id" })
  receiverId: string;

  @ManyToOne(() => Receiver, (receiver) => receiver.transactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "receiver_id" })
  receiver: Receiver;

  @Column()
  to: string;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  amount: string;

  @Column({ type: "varchar", length: 3 })
  currency: CurrencyEnum;

  @Column({ name: "payment_method" })
  paymentMethod: string;

  @Column({ type: "varchar", length: 20, default: StatusEnum.PENDING })
  status: StatusEnum;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
