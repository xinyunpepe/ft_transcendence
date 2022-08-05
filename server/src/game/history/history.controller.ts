import { ConsoleLogger, Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from '../entities/history.entity';

@Controller('history')
export class HistoryController {
	constructor ( private histroyService: HistoryService) {}

	@Get(':id')
	async findHistoryById(
		@Param('id') id: number
	) {
		return await this.histroyService.findOne(id);
	}
}
