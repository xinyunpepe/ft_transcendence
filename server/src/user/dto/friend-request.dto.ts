import { UserEntity } from "../entities/user.entity";

export type FriendRequest_Status =
	'pending' |
	'accepted' |
	'declined';

export class FriendRequestStatus {
	status: FriendRequest_Status;
}

export class FriendRequestDto {
	creator: UserEntity;
	receiver: UserEntity;
	status: FriendRequest_Status;
}
