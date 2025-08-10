import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { QueueService } from "./queue.service"
import { QueueEntry } from "../entities/queue-entry.entity"
import { CreateQueueDto } from "./dto/create-queue.dto"
import { UpdateQueueDto } from "./dto/update-queue.dto"

@ApiTags("Queue")
@Controller("queue")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @ApiOperation({ summary: "Add to queue" })
  @ApiResponse({ status: 201, description: "Added to queue successfully" })
  create(@Body() createQueueDto: CreateQueueDto) {
    return this.queueService.create(createQueueDto)
  }

  @Get()
  @ApiOperation({ summary: "Get current queue" })
  @ApiResponse({ status: 200, description: "Queue retrieved successfully" })
  findAll() {
    return this.queueService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get queue entry by ID' })
  @ApiResponse({ status: 200, description: 'Queue entry retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.queueService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update queue entry" })
  @ApiResponse({ status: 200, description: "Queue entry updated successfully" })
  update(@Param('id') id: string, @Body() updateQueueDto: UpdateQueueDto) {
    return this.queueService.update(+id, updateQueueDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove from queue' })
  @ApiResponse({ status: 200, description: 'Removed from queue successfully' })
  remove(@Param('id') id: string) {
    return this.queueService.remove(+id);
  }

  @Post("call-next")
  @ApiOperation({ summary: "Call next patient in queue" })
  @ApiResponse({ status: 200, description: "Next patient called successfully" })
  callNext(@Body() callNextDto: { doctorId?: number }) {
    return this.queueService.callNext(callNextDto.doctorId)
  }
}
