import { ConstValues } from "./const-values";

export class ClientInfo {
	public leftLogin: string;
	public rightLogin: string;
	public Heights: number[];
	public hideItem: boolean[];
	public room: number;

	constructor(public server, public userId: number) {
		this.leftLogin = '';
		this.rightLogin = '';
		this.Heights = [ConstValues.canvasHeight / 2 - ConstValues.paddleHeight / 2, ConstValues.canvasHeight / 2 - ConstValues.paddleHeight / 2];
		this.hideItem = [false, true, true, false, true, true];
		this.room = -1;
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

	modify_room(room_id: number) {
		this.room = room_id;
		this.sendInfo();
	}

	modify_heights(idx: number[], val: number[]) {
		if (idx.length != val.length) {
			console.log('error in modify_hideItem');
		}
		for (let i = 0 ; i < idx.length ; ++i) {
			this.Heights[idx[i]] = val[i];
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
			Heights: this.Heights,
			hideItem: this.hideItem,
			room: this.room,
		};
	}
}
