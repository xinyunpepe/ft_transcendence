import { ConsoleLogger, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from '../entities/history.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('history')
export class HistoryController {
	constructor ( private histroyService: HistoryService) {}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async findHistoryById(
		@Param('id') id: number
	) {
		return await this.histroyService.findOne(id);
	}
}
