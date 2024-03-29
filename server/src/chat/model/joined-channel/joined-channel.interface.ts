import { UserI } from "src/user/model/user/user.interface";
import { ChannelI } from "../channel/channel.interface";

export interface JoinedChannelI {
	id?: number;
	socketId: string;
	userId: number;
	user: UserI;
	channel: ChannelI;
}
