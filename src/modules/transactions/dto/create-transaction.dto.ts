import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { CurrencyEnum } from "../../../common/enums/currency.enum";

export class CreateTransactionDto {
  @ApiProperty({ example: "REF-2024-001" })
  @IsString()
  @MinLength(1)
  referenceNumber: string;

  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "UUID of an existing receiver (from GET /receivers)",
  })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ example: "recipient@example.com" })
  @IsString()
  @MinLength(1)
  to: string;

  @ApiProperty({ example: 100.5 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiProperty({ enum: CurrencyEnum })
  @IsEnum(CurrencyEnum)
  currency: CurrencyEnum;

  @ApiProperty({ example: "Bank Transfer" })
  @IsString()
  @MinLength(1)
  paymentMethod: string;
}
