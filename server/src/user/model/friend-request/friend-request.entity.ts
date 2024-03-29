import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { FriendStatus } from "./friend-request.interface";

@Entity('friend-request')
export class FriendRequestEntity {
	@PrimaryGeneratedColumn()
	id: number;

	// one user can have many friend-request
	@ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendRequest)
	creator: UserEntity;

	@ManyToOne(() => UserEntity, (userEntity) => userEntity.receivedFriendRequest)
	receiver: UserEntity;

	@Column({ nullable: true })
	status: FriendStatus;
}
