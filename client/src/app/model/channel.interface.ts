import { UserI } from "./user.interface";
import { Meta } from "@angular/platform-browser";

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

export interface ChannelPaginateI {
	items: ChannelI[];
	meta: Meta;
}
