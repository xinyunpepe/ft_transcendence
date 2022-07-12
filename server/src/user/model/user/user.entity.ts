import { ChannelEntity } from "src/chat/model/channel/channel.entity";
import { ConnectedUserEntity } from "src/chat/model/connected-user/connected-user.entity";
import { MessageEntity } from "src/chat/model/message/message.entity";
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole, UserStatus } from "./user.interface";
import { FriendRequestEntity } from "../friend-request/friend-request.entity";
import { MatchHistoryEntity } from "../match-history/match-history.entity";
import { JoinedChannelEntity } from "src/chat/model/joined-channel/joined-channel.entity";

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

	@Column({ type: 'enum', enum: UserStatus, default: UserStatus.OFF })
	status: UserStatus;

	@Column({ default: 0 })
	totalWins: number;

	@Column({ default: 0 })
	totalLoses: number;

	@Column({ default: 0 })
	ladderLevel: number;

	@OneToMany(() => FriendRequestEntity, friendRequest => friendRequest.creator)
	sentFriendRequest: FriendRequestEntity[];

	@OneToMany(() => FriendRequestEntity, friendRequest => friendRequest.receiver)
	receivedFriendRequest: FriendRequestEntity[];

	@OneToMany(() => MatchHistoryEntity, matchHistory => matchHistory.winner)
	wonHistory: MatchHistoryEntity[];

	@OneToMany(() => MatchHistoryEntity, matchHistory => matchHistory.loser)
	lostHistory: MatchHistoryEntity[];

	@OneToMany(() => ChannelEntity, channel => channel.owner)
	ownedChannels: ChannelEntity[];

	@ManyToMany(() => ChannelEntity, channel => channel.admin)
 	adminChannels: ChannelEntity[];

	@ManyToMany(() => ChannelEntity, channel => channel.users)
	channels: ChannelEntity[];

	@OneToMany(() => MessageEntity, message => message.user)
	messages: MessageEntity[];

	@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
	channelRole: UserRole;

	@OneToMany(() => ConnectedUserEntity, connection => connection.user)
	connections: ConnectedUserEntity[];

	@OneToMany(() => JoinedChannelEntity, joinedChannel => joinedChannel.channel)
	joinedChannels: JoinedChannelEntity[];
}
