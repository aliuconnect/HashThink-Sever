import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiExcludeController } from "@nestjs/swagger";

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  root() {
    const port = this.config.get<number>("port", 3000);
    return {
      message: "Transaction Dashboard API",
      docs: `http://localhost:${port}/api/docs`,
      health: `http://localhost:${port}/health`,
    };
  }
}
