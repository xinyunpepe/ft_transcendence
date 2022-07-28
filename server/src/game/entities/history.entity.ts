import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class History {
	@PrimaryGeneratedColumn()
	login: string;

	@Column({default: 0})
	total_wins: number;

	@Column({default: 0})
	total_losts: number;

	@Column({default: false})
	isInGame: boolean;
}