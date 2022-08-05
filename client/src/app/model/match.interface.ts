import { HistoryI } from "./history.interface";

export interface MatchI {
	roomId?: number;
	isLadder?: boolean;
	isSpeed?: boolean;
	winnerPoints?: number;
	loserPoints?: number;
	timeStamp?: string;
	winnerLogin?: string;
	loserLogin?: string;
}

// if ladder game, maybe show before + after level?