import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { StatusEnum } from "../../../common/enums/status.enum";

export class UpdateTransactionStatusDto {
  @ApiProperty({ enum: StatusEnum })
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
