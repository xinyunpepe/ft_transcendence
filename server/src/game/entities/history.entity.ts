import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { Match } from "./match.entity";

@Entity()
export class History {
	@PrimaryColumn()
	userId: number;

	@Column({default: 0})
	totalWins: number;

	@Column({default: 0})
	totalLoses: number;

	@Column({default: -1})
	inGameRoom: number;

	@Column({default: 0})
	ladderLevel: number;

	@OneToMany(()=>Match, match=>match.winner)
	winMatches: Match[];

	@OneToMany(()=>Match, match=>match.loser)
	loseMatches: Match[];

	constructor(userId: number, inGameRoom?: number) {
		this.userId = userId;
		this.totalWins = 0;
		this.totalLoses = 0;
		this.inGameRoom = inGameRoom === undefined? -1:inGameRoom;
		this.ladderLevel = 0;
	}

	win(match: Match) {
		if (this.winMatches == null) {
			this.winMatches = new Array<Match>();
		}
		this.winMatches.push(match);
		this.totalWins += 1;
		this.inGameRoom = -1;
		if (match.isLadder ) {
			this.ladderLevel += 1;
		}
	}

	lose(match: Match) {
		if (this.loseMatches == null) {
			this.loseMatches = new Array<Match>();
		}
		this.loseMatches.push(match);
		this.totalLoses += 1;
		this.inGameRoom = -1;
		if (match.isLadder ) {
			this.ladderLevel -= 1;
		}
	}

}