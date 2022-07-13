import { ChannelI } from "./channel.interface";
import { Meta } from "./meta.interface";
import { UserI } from "./user.interface";

// user from backend JWT upon creation
// createdAt, updatedAt from backend timestamps upon creation

export interface MessageI {
	id?: number;
	text: string;
	type: number;
	user?: UserI;
	channel: ChannelI;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface MessagePaginateI {
	items: MessageI[];
	meta: Meta;
}
