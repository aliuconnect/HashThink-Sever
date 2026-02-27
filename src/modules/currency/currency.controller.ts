import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CurrencyService } from "./currency.service";

@ApiTags("currencies")
@Controller("currencies")
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: "Get all currencies" })
  @ApiResponse({
    status: 200,
    description: "List of currencies (USD, IRR, INR)",
  })
  findAll() {
    return this.currencyService.findAll();
  }
}
