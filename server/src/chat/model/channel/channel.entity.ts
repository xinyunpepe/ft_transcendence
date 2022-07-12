import { MessageEntity } from "src/chat/model/message/message.entity";
import { UserEntity } from "src/user/model/user/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { JoinedChannelEntity } from "../joined-channel/joined-channel.entity";
import { ChannelType } from "./channel.interface";

@Entity('channel')
export class ChannelEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({type: 'enum', enum: ChannelType, default: ChannelType.PUBLIC})
	type: ChannelType;

	@Column()
	name: string;

	@Column({ select: false, nullable: true })
	password: string;

	@ManyToOne(() => UserEntity, user => user.ownedChannels)
	owner: UserEntity;

	@ManyToMany(() => UserEntity, user => user.channels)
	@JoinTable()
	users: UserEntity[];

	@ManyToMany(() => UserEntity, user => user.adminChannels)
	@JoinTable()
	admin: UserEntity[];

	@ManyToMany(() => UserEntity)
	@JoinTable()
	blocked: UserEntity[];

	@OneToMany(() => JoinedChannelEntity, joinedChannel => joinedChannel.channel)
	joinedUsers: JoinedChannelEntity[];

	@OneToMany(() => MessageEntity, message => message.channel)
	messages: MessageEntity[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
