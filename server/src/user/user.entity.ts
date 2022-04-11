import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	login: string

	@Column({ default: '', unique: true })
	username: string

	@Column({ default: 'default'})
	avatar: string

	@Column({ default: false })
	isTwoFactorAuthEnabled: boolean

	@Column({ default: 'offline'})
	status: string
}
