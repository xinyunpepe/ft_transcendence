export interface matchI {
	roomId?: number;
	winner?: string;
	loser?: string;
	isLadder?: boolean;
	isPowerUp?: boolean;
	winnerPoints?: number;
	loserPoints?: number;
	timeStamp?: string;
}

// if ladder game, maybe show before + after level?