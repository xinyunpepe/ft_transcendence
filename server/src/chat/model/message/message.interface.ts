import { UserI } from "src/user/model/user/user.interface";
import { ChannelI } from "../channel/channel.interface";

export interface MessageI {
	id?: number;
	text: string;
	user: UserI;
	channel: ChannelI;
	createdAt: Date;
	updatedAt: Date;
}
