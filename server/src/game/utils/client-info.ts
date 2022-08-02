import { ConstValues } from "./const-values";

export class ClientInfo {
	public leftLogin: string;
	public rightLogin: string;
	public hideItem: boolean[];

	constructor(public server, public userId: number) {
		this.leftLogin = '';
		this.rightLogin = '';
		this.hideItem = [false, true, true, false, true, true];
	}

	modify_Logins(logins: string[]) {
		this.leftLogin = logins[0];
		this.rightLogin = logins[1];
		this.sendInfo();
	}

	modify_hideItem(idx: number[], val: boolean[]) {
		if (idx.length != val.length) {
			console.log('error in modify_hideItem');
		}
		for (let i = 0 ; i < idx.length ; ++i) {
			this.hideItem[idx[i]] = val[i];
		}
		this.sendInfo();
	}

	sendInfo() {
		this.server.to(this.userId).emit(ConstValues.ClientInfo, JSON.stringify(this.getJSON()));
	}

	getJSON() {
		return {
			leftLogin: this.leftLogin,
			rightLogin: this.rightLogin,
			hideItem: this.hideItem
		};
	}
}
