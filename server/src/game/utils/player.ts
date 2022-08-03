import { ConstValues } from "./const-values";

export class Player {
	public height: number;
	public point: number = 0;
	constructor (public id: number, public login: string, public carryBall: boolean) {
	  this.height = ConstValues.canvasHeight / 2 - ConstValues.paddleHeight / 2;
	  // this.point = 0;
	}
  
	init() {
	  this.height = ConstValues.canvasHeight / 2 - ConstValues.paddleHeight / 2;
	}
  
	getJSON() {
	  return {
		type: "Player",
		content: {
		  id: this.id,
		  login: this.login
		}
	  };
	}
  }