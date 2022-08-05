import { MatchI } from "./match.interface";

export interface HistoryI {
	userId?: number;
	totalWins?: number;
	totalLoses?: number;
	inGameRoom?: number; // -1 means not in a game, otherwise it'll show room number
	ladderLevel? : number;
	winMatches?: MatchI[];
	loseMatches?: MatchI[];
}
