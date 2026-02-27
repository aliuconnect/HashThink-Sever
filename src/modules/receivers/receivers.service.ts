import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Receiver } from "./entities/receiver.entity";

@Injectable()
export class ReceiversService {
  constructor(
    @InjectRepository(Receiver)
    private readonly receiverRepository: Repository<Receiver>,
  ) {}

  async findAll(): Promise<Receiver[]> {
    return this.receiverRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Receiver> {
    const receiver = await this.receiverRepository.findOne({ where: { id } });
    if (!receiver) {
      throw new NotFoundException(`Receiver with ID ${id} not found`);
    }
    return receiver;
  }
}
