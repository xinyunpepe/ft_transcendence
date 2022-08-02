import { ConstValues } from "./const-values";

export class ClientInfo {
	public leftLogin: string;
	public rightLogin: string;

	constructor(public server, public userId: number) {
		this.leftLogin = '';
		this.rightLogin = '';
	}

	modify_leftLogin(login: string) {
		this.leftLogin = login;
	}

	modify_rightLogin(login: string) {
		this.rightLogin = login;
	}

	sendInfo() {
		this.server.to(this.userId).emit(ConstValues.ClientInfo, JSON.stringify(this.getJSON()));
	}

	getJSON() {
		return {
			leftLogin: this.leftLogin,
			rightLogin: this.rightLogin
		};
	}
}
