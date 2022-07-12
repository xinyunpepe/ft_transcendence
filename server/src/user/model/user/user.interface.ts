import { ChannelI } from "src/chat/model/channel/channel.interface";

export enum UserRole {
	OWNER = 'owner',
	ADMIN = 'admin',
	USER = 'user',
}

export enum UserStatus {
	ON = 'online',
	OFF = 'offline',
	GAME = 'in-game'
}

export interface UserI {
	id?: number;
	login?: string;
	username?: string;
	avatar?: string;
	isTwoFactorAuthEnabled?: boolean;
	twoFactorAuthSecret?: string;
	status?: UserStatus;
	totalWins?: number;
	totalLoses?: number;
	ladderLevel?: number;
	channelRole?: UserRole;
	ownedChannels?: ChannelI[];
}
