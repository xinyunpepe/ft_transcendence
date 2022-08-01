import { Player } from "./player";
import { Ball } from "./ball";

export class GameRoom {
	static readonly MoveDistance: number = 10;
	public ball: Ball;
	constructor (public player1: Player, public player2: Player) {
	  this.ball = new Ball(player1.id); // todo?
	}
}
