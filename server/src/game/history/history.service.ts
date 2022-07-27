import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
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

	async readAll(): Promise<History[]> {
		return await this.HistoryRepository.find();
	}

	async update(history: History): Promise<UpdateResult>{
		return this.HistoryRepository.update(history.room_id, history);
	}

	async delete(room_id): Promise<DeleteResult> {
		return await this.HistoryRepository.delete(room_id);
	}

	async GameStart(room_number: number, player1_id: string, player2_id: string) {
		let newGame: History;
		newGame.room_id = room_number;
		newGame.player1 = player1_id;
		newGame.player2 = player2_id;
		newGame.player1_score = 0;
		newGame.player2_score = 0;
		newGame.status = 'In Game';
		this.create(newGame);
	}

	async GameUpdate(room_number: number, player1_id: string, player2_id: string, player1_point: number, player2_point: number, status: string) {
		let Game: History;
		Game.room_id = room_number;
		Game.player1 = player1_id;
		Game.player2 = player2_id;
		Game.player1_score = player1_point;
		Game.player2_score = player2_point;
		Game.status = status;
		this.update(Game);
	}
}
