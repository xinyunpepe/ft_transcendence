import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult, LimitOnUpdateNotSupportedError } from 'typeorm';
import { History } from '../entities/history.entity';

@Injectable()
export class HistoryService {
	constructor(
		@InjectRepository(History)
		private HistoryRepository: Repository<History>
	) {}

	async create (history: History): Promise<History> {
		return await this.HistoryRepository.save(history);
	}

	// async findAll(): Promise<History[]> {
	// 	return await this.HistoryRepository.find();
	// }

	async findOne(login: string): Promise<History> {
		return await this.HistoryRepository.findOne({ where: { login: login }});
	}
	async update(history: History): Promise<UpdateResult>{
		return await this.HistoryRepository.update(history.login, history);
	}

	// async delete(room_id): Promise<DeleteResult> {
	// 	return await this.HistoryRepository.delete(room_id);
	// }

	// async GameStart(room_number: number, player1_id: string, player2_id: string) {
	// 	let newGame: History = new History;
	// 	newGame.room_id = room_number;
	// 	newGame.player1 = player1_id;
	// 	newGame.player2 = player2_id;
	// 	newGame.player1_score = 0;
	// 	newGame.player2_score = 0;
	// 	newGame.status = 'In Game';
	// 	this.create(newGame);
	// }

	// async GameUpdate(room_number: number, player1_id: string, player2_id: string, player1_point: number, player2_point: number, status: string) {
	// 	let Game: History = new History;
	// 	Game.room_id = room_number;
	// 	Game.player1 = player1_id;
	// 	Game.player2 = player2_id;
	// 	Game.player1_score = player1_point;
	// 	Game.player2_score = player2_point;
	// 	Game.status = status;
	// 	this.update(Game);
	// }

	async GameStart(player1Id: number, player2Id: number) {
		// let history1 = this.findOne(player1);
		// console.log(history1);
		// let history2 = this.findOne(player2);
		// if (history1) {
		// 	let history = new History;
		// 	history.login = player1;
		// 	history.total_losts = (await history1).total_losts;
		// 	history.total_wins = (await history1).total_wins;
		// 	history.isInGame = true;
		// 	this.update(history);
		// }
		// else {
		// 	let history = new History;
		// 	history.login = player1;
		// 	history.isInGame = true;
		// 	this.create(history);
		// }
		// if (history2) {
		// 	let history = new History;
		// 	history.login = player2;
		// 	history.total_losts = (await history2).total_losts;
		// 	history.total_wins = (await history2).total_wins;
		// 	history.isInGame = true;
		// 	this.update(history);
		// }
		// else {
		// 	let history = new History;
		// 	history.login = player2;
		// 	history.isInGame = true;
		// 	this.create(history);
		// }
	}

	async GameFinish(room_id: number, winner: string, loser: string) {
		// let history1 = this.findOne(winner);
		// let history2 = this.findOne(loser);

		
		// let history = new History;
		// history.login = winner;
		// history.total_losts = (await history1).total_losts;
		// history.total_wins = (await history1).total_wins + 1;
		// history.isInGame = false;
		// this.update(history);

		// history.login = loser;
		// history.total_losts = (await history2).total_losts + 1;
		// history.total_wins = (await history2).total_wins;
		// history.isInGame = false;
		// this.update(history);


	}
}
