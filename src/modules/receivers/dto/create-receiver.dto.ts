import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateReceiverDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: "john@example.com" })
  @IsEmail()
  email: string;
}
