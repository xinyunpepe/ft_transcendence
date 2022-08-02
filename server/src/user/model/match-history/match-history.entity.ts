import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity('match-history')
export class MatchHistoryEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
	time: string; 

	@ManyToOne(() => UserEntity, (userEntity) => userEntity.wonHistory)
	winner: UserEntity;

	@ManyToOne(() => UserEntity, (userEntity) => userEntity.lostHistory)
	loser: UserEntity;

	@Column()
	winnerScore: number;

	@Column()
	loserScore: number;
}
