import { UserI } from "../../../user/model/user/user.interface";

export interface ConnectedUserI {
	id?: number;
	socketId: string;
	user: UserI;
}
