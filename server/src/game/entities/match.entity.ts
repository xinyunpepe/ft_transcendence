import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { History } from "./history.entity";

@Entity()
export class Match {
	@PrimaryColumn()
	roomId: number;

	@Column()
	isLadder: boolean;

	@Column()
	isSpeed: boolean;

	@Column()
	winnerPoints: number;

	@Column()
	loserPoints: number;

	@Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
	timeStamp: string;

	@ManyToOne(()=>History, history=>history.winMatches)
	winner: History;

	@ManyToOne(()=>History, history=>history.loseMatches)
	loser: History;

	constructor(roomId: number, isLadder: boolean, isSpeed: boolean, winnerPoints: number, loserPoints: number, winner: History, loser: History) {
		this.roomId = roomId;
		this.isLadder = isLadder;
		this.isSpeed = isSpeed;
		this.winnerPoints = winnerPoints;
		this.loserPoints = loserPoints;
		this.winner = winner;
		this.loser = loser;
	}
}