import { MessageEntity } from "src/chat/entities/message.entity";
import { UserEntity } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('channel')
export class ChannelEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	type: 'public' | 'private';

	@Column({ unique: true })
	name: string;

	@Column()
	isPasswordRequired: boolean;

	@Column()
	isDirect: boolean;

	@Column({ nullable: true })
	password: string;

	@ManyToOne(() => UserEntity, (userEntity) => userEntity.ownedChannels)
	owner: UserEntity;

	@ManyToMany(() => UserEntity, (userEntity) => userEntity.channels)
	@JoinTable()
	users: UserEntity[];

	@OneToMany(() => MessageEntity, (messageEntity) => messageEntity.channel)
	messages: MessageEntity[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
