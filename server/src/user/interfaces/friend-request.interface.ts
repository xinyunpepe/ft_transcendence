import { UserEntity } from "../model/entities/user.entity";

export type FriendRequest_Status =
	'pending' |
	'accepted' |
	'declined';

export interface FriendRequestStatus {
	status: FriendRequest_Status;
}

// export interface FriendRequest {
// 	id: number;
// 	creator: UserEntity;
// 	receiver: UserEntity;
// 	status: FriendRequest_Status;
// }
