import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	login: string

	@Column({ default: '', unique: true })
	username: string

	@Column({ default: 'default'})
	avatar: string

	@Column({ default: false })
	isTwoFactorAuthEnabled: boolean

	@Column({ nullable: true })
	twoFactorAuthSecret?: string

	@Column({ default: 'offline'})
	status: string
}
