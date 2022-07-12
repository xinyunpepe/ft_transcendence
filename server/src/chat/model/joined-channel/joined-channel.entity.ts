import { UserEntity } from "src/user/model/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelEntity } from "../channel/channel.entity";

@Entity()
export class JoinedChannelEntity {

	@PrimaryGeneratedColumn()
	id: number

	@Column()
	socketId: string;

	@ManyToOne(() => UserEntity, user => user.joinedChannels)
	@JoinColumn()
	user: UserEntity;

	@ManyToOne(() => ChannelEntity, channel => channel.joinedUsers)
	@JoinColumn()
	channel: ChannelEntity;
}
