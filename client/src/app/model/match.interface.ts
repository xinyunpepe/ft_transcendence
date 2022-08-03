import { HistoryI } from "./history.interface";

export interface matchI {
	roomId?: number;
	isLadder?: boolean;
	isSpeed?: boolean;
	winnerPoints?: number;
	loserPoints?: number;
	timeStamp?: string;
	winner?: HistoryI;
	loser?: HistoryI;
}

// if ladder game, maybe show before + after level?