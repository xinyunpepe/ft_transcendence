import { ChannelEntity } from "src/chat/entities/channel.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('message')
export class MessageEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@ManyToOne(() => ChannelEntity, (channelEntity) => channelEntity.messages)
	channel: ChannelEntity;

	@ManyToOne(() => UserEntity, (userEntity) => userEntity.messages)
	user: UserEntity;
}
