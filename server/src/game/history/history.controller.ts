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

	/*@Get('WinMatches/:id')
	async findWinMatchesById(
		@Param('id') id:number
	) {
		return await this.histroyService.getWinMatches(id);
	}

	@Get('LoseMatches/:id')
	async findLoseMatchesById(
		@Param('id') id:number
	) {
		let ret = await this.histroyService.getLoseMatches(id);
		// console.log(ret);
		return ret;
	}

	@Get('lol/:id')
	async findHistories() {
		return await this.histroyService.getAll();
	}

	@Get('matches/:id')
	async findMatches(
	) {
		let ret = await this.histroyService.getMatches();
		console.log(ret);
		return ret;
	}*/
}
