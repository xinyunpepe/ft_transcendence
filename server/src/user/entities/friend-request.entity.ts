import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('friend-request')
export class FriendRequestEntity {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendRequest)
	creator: UserEntity

	@ManyToOne(() => UserEntity, (userEntity) => userEntity.receivedFriendRequest)
	receiver: UserEntity

	@Column({ nullable: false })
	status: string
}
