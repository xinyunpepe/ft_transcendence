import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class History {
	@PrimaryGeneratedColumn()
	room_id: number;

	@Column()
	player1: string;

	@Column()
	player2: string;

	@Column()
	player1_score: number;

	@Column()
	player2_score: number;

	@Column()
	status: string;
}