import { Player } from "./player";
import { Ball } from "./ball";

export class GameRoom {
	static readonly MoveDistance: number = 10;
	public ball: Ball;
	public WatcherIds: number[];
	constructor (public player1: Player, public player2: Player) {
	  this.ball = new Ball(player1.id); // todo?
	  this.WatcherIds = [];
	}

	sendToPlayers(server: any, event: string, json: string) {
		server.to(this.player1.id).to(this.player2.id).emit(event, json);
	}

	sendToWatchers(server: any, event: string, json: string) {
		for (let i = 0 ; i < this.WatcherIds.length ; ++i) {
			server.to(this.WatcherIds[i]).emit(event, json);
		}
	}

	sendToAll(server: any, event: string, json: string) {
		this.sendToPlayers(server, event, json);
		this.sendToWatchers(server, event, json);
	}

}
