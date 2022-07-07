export type STATUS = 'online' | 'offline' | 'in-game'

export interface UserI {
	id?: number;
	login?: string;
	username?: string;
	avatar?: string;
	isTwoFactorAuthEnabled?: boolean;
	twoFactorAuthSecret?: string;
	status?: STATUS;
	totalWins?: number;
	totalLoses?: number;
	ladderLevel?: number;
}
