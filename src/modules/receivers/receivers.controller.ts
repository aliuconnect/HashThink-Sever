import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ReceiversService } from "./receivers.service";

@ApiTags("receivers")
@Controller("receivers")
export class ReceiversController {
  constructor(private readonly receiversService: ReceiversService) {}

  @Get()
  @ApiOperation({ summary: "Get all receivers" })
  @ApiResponse({ status: 200, description: "List of receivers" })
  findAll() {
    return this.receiversService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get receiver by ID" })
  @ApiResponse({ status: 200, description: "Receiver found" })
  @ApiResponse({ status: 404, description: "Receiver not found" })
  findOne(@Param("id") id: string) {
    return this.receiversService.findOne(id);
  }
}
