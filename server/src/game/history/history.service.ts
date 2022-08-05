import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { max } from 'rxjs';
import { Repository, UpdateResult, DeleteResult, LimitOnUpdateNotSupportedError } from 'typeorm';
import { History } from '../entities/history.entity';
import { Match } from '../entities/match.entity';
import { competitionEnumerator, customizationEnumerator } from '../utils/enumerators';
import { GameRoom } from '../utils/game-room';

@Injectable()
export class HistoryService {
	constructor(
		@InjectRepository(History)
		private HistoryRepository: Repository<History>,
		@InjectRepository(Match)
		private MatchRepository: Repository<Match>
	) {}

	async create (history: History): Promise<History> {
		return await this.HistoryRepository.save(history);
	}

	async create_match(match: Match): Promise<Match> {
		return await this.MatchRepository.save(match);
	}

	async findOne(userId: number): Promise<History> {
		return await this.HistoryRepository.findOne({ where: { userId: userId }});
	}
	async update(history: History): Promise<UpdateResult>{
		return await this.HistoryRepository.update(history.userId, history);
	}

	async GameStart(gameRoom: GameRoom) {
		let player1 = gameRoom.player1;
		let player2 = gameRoom.player2;
		let player1_history:any = await this.findOne(player1.id);
		let player2_history:any = await this.findOne(player2.id);
		if (player1_history == null) {
			player1_history = new History(player1.id, gameRoom.room_number);
		}
		else {
			player1_history.roomId = gameRoom.room_number;
		}
		if (player2_history == null) {
			player2_history = new History(player2.id, gameRoom.room_number);
		}
		else {
			player2_history.roomId = gameRoom.room_number;
		}
		await this.create(player1_history);
		await this.create(player2_history);
	}

	async GameFinish(gameRoom: GameRoom) {
		let player1 = gameRoom.player1;
		let player2 = gameRoom.player2;
		let player1_history = await this.findOne(player1.id);
		let player2_history = await this.findOne(player2.id);
		let match: Match;
		if (player1.point > player2.point) {
			match = new Match(gameRoom.room_number, gameRoom.hashes[0] == competitionEnumerator['ladder'], gameRoom.hashes[1] == customizationEnumerator['speed'], player1.point, player2.point, player1.login, player2.login,player1_history, player2_history);
			player1_history.win(match);
			player2_history.lose(match);
		}
		else {
			match = new Match(gameRoom.room_number, gameRoom.hashes[0] == competitionEnumerator['ladder'], gameRoom.hashes[1] == customizationEnumerator['speed'], player2.point, player1.point, player2.login, player1.login, player2_history, player1_history);
			player2_history.win(match);
			player1_history.lose(match);
		}
		await this.create_match(match);
		await this.create(player1_history);
		await this.create(player2_history);
		// console.log((await this.findOne(player1.id)).totalWins);
	}

	/*async getWinMatches(userId: number) {
		let history = await this.findOne(userId);
		if (history == null)
			return [];
		return history.winMatches;
	}

	async getLoseMatches(userId: number) {
		let history = await this.findOne(userId);
		if (history == null) {
			return [];
		}
		// console.log(history);
		return history.loseMatches;
	}

	async getMatches() {
		console.log('aaa');
		return await this.MatchRepository.find();
	}

	async getAll() {
		return await this.HistoryRepository.find();
	}*/
}
