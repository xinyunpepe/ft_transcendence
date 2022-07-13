import { ChannelEntity } from "src/chat/model/channel/channel.entity";
import { UserEntity } from "src/user/model/user/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('message')
export class MessageEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	text: string;

	@Column({ nullable: true })
	type: number;

	@ManyToOne(() => UserEntity, user => user.messages)
	@JoinColumn()
	user: UserEntity;

	@ManyToOne(() => ChannelEntity, channel => channel.messages)
	@JoinTable()
	channel: ChannelEntity;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
