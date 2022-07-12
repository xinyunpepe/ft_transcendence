import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { UserEntity } from "../../../user/model/user/user.entity";

@Entity('connected-user')
export class ConnectedUserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	socketId: string;

	@ManyToOne(() => UserEntity, user => user.connections)
	@JoinColumn()
	user: UserEntity;
}
