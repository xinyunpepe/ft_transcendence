import { EntitySchema } from "typeorm";

export class CreateUserDto {
	login: string;
	username: string;
	avatar: string;
	status: string;
}

export class UpdateUserDto {
	username: string;
	avatar: string;
}
