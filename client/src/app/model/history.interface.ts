import { matchI } from "./match.interface";

export interface HistoryI {
	userId?: number;
	total_wins?: number;
	total_loses?: number;
	isInGame?: boolean;
	matches?: matchI[];
} 