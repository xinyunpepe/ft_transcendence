import { ChannelEntity } from "src/chat/entities/channel.entity";
import { MessageEntity } from "src/chat/entities/message.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FriendRequestEntity } from "./friend-request.entity";
import { MatchHistoryEntity } from "./match-history.entity";

@Entity('user')
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	login: string;

	@Column({ default: '', unique: true })
	username: string;

	@Column({ default: 'default'})
	avatar: string;

	@Column({ default: false })
	isTwoFactorAuthEnabled: boolean;

	@Column({ nullable: true })
	twoFactorAuthSecret?: string;

	@Column({ default: 'offline'})
	status: string;

	@Column({ default: 0 })
	totalWins: number;

	@Column({ default: 0 })
	totalLoses: number;

	@Column({ default: 0 })
	ladderLevel: number;

	@OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.creator)
	sentFriendRequest: FriendRequestEntity[];

	@OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.receiver)
	receivedFriendRequest: FriendRequestEntity[];

	@OneToMany(() => MatchHistoryEntity, (matchHistoryEntity) => matchHistoryEntity.winner)
	wonHistory: MatchHistoryEntity[];

	@OneToMany(() => MatchHistoryEntity, (matchHistoryEntity) => matchHistoryEntity.loser)
	lostHistory: MatchHistoryEntity[];

	@OneToMany(() => ChannelEntity, (channelEntity) => channelEntity.owner)
	ownedChannels: ChannelEntity;

	@ManyToMany(() => ChannelEntity, (channelEntity) => channelEntity.users)
	channels: ChannelEntity[];

	@OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
	messages: MessageEntity[];
}
