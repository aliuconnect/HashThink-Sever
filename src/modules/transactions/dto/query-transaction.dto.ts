import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { Type } from "class-transformer";
import { CurrencyEnum } from "../../../common/enums/currency.enum";
import { StatusEnum } from "../../../common/enums/status.enum";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryTransactionDto extends PaginationDto {
  @ApiPropertyOptional({ enum: CurrencyEnum })
  @IsOptional()
  @IsEnum(CurrencyEnum)
  currency?: CurrencyEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  receiverId?: string;

  @ApiPropertyOptional({ description: 'Search in "to" field' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ enum: StatusEnum, description: "Filter by status" })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;

  @ApiPropertyOptional({ description: "General search (to, status)" })
  @IsOptional()
  @IsString()
  search?: string;
}
