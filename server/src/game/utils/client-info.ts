export class ClientInfo {
	public leftlogin: string;
	public rightLogin: string;

	constructor() {
		this.leftlogin = '';
		this.rightLogin = '';
	}

	getJSON() {
		return {
			leftLogin: this.leftlogin,
			rightLogin: this.rightLogin
		};
	}
}
