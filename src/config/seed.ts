import "dotenv/config";
import { DataSource } from "typeorm";
import { CurrencyEnum } from "../common/enums/currency.enum";
import { Receiver } from "../modules/receivers/entities/receiver.entity";
import { Currency } from "../modules/currency/entities/currency.entity";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "db.dzwladcgmobynjswsksf.supabase.co",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: false,
});

async function seed() {
  await AppDataSource.initialize();

  const receiverRepo = AppDataSource.getRepository(Receiver);
  const currencyRepo = AppDataSource.getRepository(Currency);

  const receivers = await receiverRepo.count();
  if (receivers === 0) {
    await receiverRepo.save([
      { name: "Alice Smith", email: "alice@example.com" },
      { name: "Bob Jones", email: "bob@example.com" },
      { name: "Carol White", email: "carol@example.com" },
    ]);
    console.log("Seeded receivers");
  }

  const currencies = await currencyRepo.count();
  if (currencies === 0) {
    await currencyRepo.save([
      { code: CurrencyEnum.USD, name: "US Dollar" },
      { code: CurrencyEnum.IRR, name: "Iranian Rial" },
      { code: CurrencyEnum.INR, name: "Indian Rupee" },
    ]);
    console.log("Seeded currencies");
  }

  await AppDataSource.destroy();
  console.log("Seed completed");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
