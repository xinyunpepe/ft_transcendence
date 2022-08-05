import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
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

	@Column()
	winnerLogin: string;

	@Column()
	loserLogin: string;

	@ManyToOne(()=>History, history=>history.winMatches, {eager: false})
	@JoinColumn()
	winner: History;

	@ManyToOne(()=>History, history=>history.loseMatches, {eager: false})
	@JoinColumn()
	loser: History;

	constructor(roomId: number, isLadder: boolean, isSpeed: boolean, winnerPoints: number, loserPoints: number, winnerLogin: string, loserLogin: string, winner: History, loser: History) {
		this.roomId = roomId;
		this.isLadder = isLadder;
		this.isSpeed = isSpeed;
		this.winnerPoints = winnerPoints;
		this.loserPoints = loserPoints;
		this.winnerLogin = winnerLogin;
		this.loserLogin = loserLogin;
		this.winner = winner;
		this.loser = loser;
	}
}