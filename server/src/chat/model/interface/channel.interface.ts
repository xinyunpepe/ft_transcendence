import { UserI } from "src/user/model/interface/user.interface";

export type TYPE = 'public' | 'private' | 'protected';

export interface ChannelI {
	id?: number;
	type?: TYPE;
	name?: string;
	isPasswordRequired?: boolean;
	isDirect?: boolean;
	password?: string;
	owner?: UserI;
	users?: UserI[];
	createdAt?: Date;
	updatedAt?: Date;
}
