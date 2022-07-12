import { UserStatus } from "./user.interface";

export class CreateUserDto {
	login: string;
	username: string;
	avatar: string;
	status: UserStatus;
}

export class UpdateUserDto {
	username: string;
	avatar: string;
}
