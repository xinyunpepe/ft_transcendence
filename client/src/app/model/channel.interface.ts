import { Meta } from "./meta.interface";
import { UserI } from "./user.interface";

export enum ChannelType {
	PUBLIC = 'public',
	PRIVATE = 'private',
	PROTECTED = 'protected'
}

export interface ChannelI {
	id?: number;
	type?: ChannelType;
	name?: string;
	password?: string;
	owner?: UserI;
	users?: UserI[];
	admin?: UserI[];
	mute?: UserI[];
	createdAt?: Date;
	updatedAt?: Date;
}

export interface ChannelPaginateI {
	items: ChannelI[];
	meta: Meta;
}
