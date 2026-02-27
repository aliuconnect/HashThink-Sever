import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Transaction } from "../../transactions/entities/transaction.entity";

@Entity("receivers")
export class Receiver {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.receiver)
  transactions: Transaction[];
}
