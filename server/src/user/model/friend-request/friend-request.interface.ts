import { UserI } from "../user/user.interface";

export type FriendRequest_Status =
	'pending' |
	'accepted' |
	'declined' |
	'blocked';

export interface FriendRequestStatus {
	status: FriendRequest_Status;
}

export interface FriendRequestI {
	id: number;
	creator: UserI;
	receiver: UserI;
	status: FriendRequest_Status;
}
