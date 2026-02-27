import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, ILike } from "typeorm";
import { Transaction } from "./entities/transaction.entity";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionStatusDto } from "./dto/update-transaction-status.dto";
import { QueryTransactionDto } from "./dto/query-transaction.dto";
import { PaginatedResult } from "../../common/dto/pagination.dto";
import { StatusEnum } from "../../common/enums/status.enum";
import { RedisService } from "../redis/redis.service";
import { TransactionsGateway } from "../websocket/transactions.gateway";
import { ReceiversService } from "../receivers/receivers.service";

const CACHE_TTL = 60;
const CACHE_KEY_PREFIX = "transactions";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly redis: RedisService,
    private readonly gateway: TransactionsGateway,
    private readonly receiversService: ReceiversService,
  ) {}

  private cacheKey(query: QueryTransactionDto): string {
    const parts = [
      CACHE_KEY_PREFIX,
      query.currency ?? "all",
      query.receiverId ?? "all",
      query.status ?? "all",
      String(query.page ?? 1),
      String(query.limit ?? 10),
      query.to ?? "",
      query.search ?? "",
    ];
    return parts.join(":");
  }

  async findAll(
    query: QueryTransactionDto,
  ): Promise<PaginatedResult<Transaction>> {
    const cacheKey = this.cacheKey(query);
    const cached = await this.redis.get<PaginatedResult<Transaction>>(cacheKey);
    if (cached) return cached;

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Transaction> = {};

    if (query.currency) where.currency = query.currency;
    if (query.receiverId) where.receiverId = query.receiverId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.to = ILike(`%${query.search}%`);
    } else if (query.to) {
      where.to = ILike(`%${query.to}%`);
    }

    const [data, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ["receiver"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const result: PaginatedResult<Transaction> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    await this.redis.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const existing = await this.transactionRepository.findOne({
      where: { referenceNumber: dto.referenceNumber },
    });
    if (existing) {
      throw new BadRequestException(
        `Transaction with reference ${dto.referenceNumber} already exists`,
      );
    }
    try {
      await this.receiversService.findOne(dto.receiverId);
    } catch {
      throw new BadRequestException(
        `Receiver with ID ${dto.receiverId} not found`,
      );
    }

    const transaction = this.transactionRepository.create({
      ...dto,
      amount: String(dto.amount),
      status: StatusEnum.PENDING,
    });
    const saved = await this.transactionRepository.save(transaction);
    await this.redis.invalidateTransactionsCache();
    this.gateway.emitTransactionCreated(saved);
    return saved;
  }

  async updateStatus(
    id: string,
    dto: UpdateTransactionStatusDto,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ["receiver"],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    transaction.status = dto.status;
    const updated = await this.transactionRepository.save(transaction);
    await this.redis.invalidateTransactionsCache();
    this.gateway.emitTransactionUpdated(updated);
    return updated;
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ["receiver"],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async download(id: string): Promise<{ buffer: Buffer; filename: string }> {
    const transaction = await this.findOne(id);
    const content = [
      `Transaction: ${transaction.referenceNumber}`,
      `To: ${transaction.to}`,
      `Amount: ${transaction.amount} ${transaction.currency}`,
      `Status: ${transaction.status}`,
      `Created: ${transaction.createdAt.toISOString()}`,
    ].join("\n");
    const buffer = Buffer.from(content, "utf-8");
    const filename = `transaction-${transaction.referenceNumber}.txt`;
    return { buffer, filename };
  }
}
