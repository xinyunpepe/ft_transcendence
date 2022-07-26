import { UserI } from "../user/user.interface";

export enum FriendStatus {
	PENDING = 'pending',
	ACCEPTED = 'accepted',
	DECLIEND = 'declined',
	BLOCKED = 'blocked',
	NOTSENT = 'not-sent'
}

export interface FriendRequestI {
	id?: number;
	creator?: UserI;
	receiver?: UserI;
	status?: FriendStatus;
}
