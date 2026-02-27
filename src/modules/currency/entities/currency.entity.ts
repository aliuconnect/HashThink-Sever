import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { CurrencyEnum } from "../../../common/enums";

@Entity("currencies")
export class Currency {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 3, unique: true })
  code: CurrencyEnum;

  @Column()
  name: string;
}
