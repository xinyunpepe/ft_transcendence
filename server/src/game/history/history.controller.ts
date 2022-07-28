import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from '../entities/history.entity';

@Controller('history')
export class HistoryController {
	constructor ( private histroyService: HistoryService) {}

	@Get(':login')
	findHistoryByLogin(
		@Param('login') login: string
	) {
		let history = this.histroyService.findOne(login);
		
		return history;
	}

	/*
	@Get(':login')
	// findOne(@Param() param: { id: number } ) Return the param as an object
	findUserByLogin(
		@Param('login') login: string
	) {
		return this.userService.findUserByLogin(login);
	}
*/

}
