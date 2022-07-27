import { Controller, Get } from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from '../entities/history.entity';

@Controller('history')
export class HistoryController {
	constructor ( private histroyService: HistoryService) {}

	@Get()
	read(): Promise<History[]> {
		return this.histroyService.readAll();
	}

	

}
