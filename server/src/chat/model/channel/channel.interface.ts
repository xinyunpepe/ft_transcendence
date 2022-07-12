import { UserI } from "src/user/model/user/user.interface";

export enum ChannelType {
	PUBLIC = 'public',
	PRIVATE = 'private',
	PROTECTED = 'protected',
}

export interface ChannelI {
	id?: number;
	type?: ChannelType;
	name?: string;
	password?: string;
	owner?: UserI;
	users?: UserI[];
	admin?: UserI[];
	blocked?: UserI[];
	createdAt?: Date;
	updatedAt?: Date;
}
