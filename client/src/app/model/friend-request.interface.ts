import { UserI } from "./user.interface";

export enum FriendStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	DECLIEND = 'declined',
	BLOCKED = 'blocked',
}

export interface FriendRequestI {
	id?: number;
	creator?: UserI;
	receiver?: UserI;
	status?: FriendStatus;
}
