export class Response {
	constructor (public type: string, public content?: any) {}

	getJSON() {
		if (this.content) {
		return {type: this.type, content: this.content};
		}
		return {type: this.type};
	}
}