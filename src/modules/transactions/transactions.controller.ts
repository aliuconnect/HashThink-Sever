import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Res,
  ParseUUIDPipe,
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { UpdateTransactionStatusDto } from "./dto/update-transaction-status.dto";
import { QueryTransactionDto } from "./dto/query-transaction.dto";

@ApiTags("transactions")
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: "List transactions with filters and pagination" })
  @ApiResponse({ status: 200, description: "Paginated list of transactions" })
  findAll(@Query() query: QueryTransactionDto) {
    return this.transactionsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiResponse({ status: 201, description: "Transaction created" })
  @ApiResponse({
    status: 400,
    description: "Bad request / duplicate reference",
  })
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update transaction status (approved/pending)" })
  @ApiResponse({ status: 200, description: "Status updated" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionStatusDto,
  ) {
    return this.transactionsService.updateStatus(id, dto);
  }

  @Get(":id/download")
  @ApiOperation({ summary: "Download transaction as sample file" })
  @ApiResponse({ status: 200, description: "File download" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  async download(
    @Param("id", ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, filename } = await this.transactionsService.download(id);
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
