import { ChannelEntity } from "src/chat/model/entities/channel.entity";
import { UserEntity } from "src/user/model/entities/user.entity";
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
