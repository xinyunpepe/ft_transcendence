import { ConstValues } from "./const-values";

export class Ball {
	public x: number;
	public y: number;
	public vx: number;
	public vy: number;
	public isCarried: boolean;
	public ballCarrierId: number;
	constructor (public readonly player1Id: number) {
		this.init(player1Id);
	}

	init(ballCarrierId: number) { // 1 or 2
		this.ballCarrierId = ballCarrierId;
		this.isCarried = true;
		if (this.ballCarrierId == this.player1Id) {
		this.x = ConstValues.paddleWidth;
		this.y = ConstValues.canvasHeight / 2 - ConstValues.ballHeight / 2;
		this.vx = 5;
		this.vy = 5;
		}
		else {
		this.x = ConstValues.canvasWidth - ConstValues.ballWidth - ConstValues.paddleWidth;
		this.y = ConstValues.canvasHeight / 2 - ConstValues.ballHeight / 2;
		this.vx = -5;
		this.vy = -5;
		}
	}

	destroy() {
		this.isCarried = false;
		this.x = ConstValues.canvasWidth;
		this.y = ConstValues.canvasHeight;
	}

	getJSON() {
		return {
		type: "Ball",
		content: {
			id: this.player1Id,
			x: this.x,
			y: this.y
		}
		};
	}
}
  
