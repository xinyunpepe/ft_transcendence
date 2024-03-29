import { Player } from "./player";
import { Ball } from "./ball";
import { ClientInfo } from "./client-info";

export class ModifyAttributes{
	static readonly Logins = 'Logins';
	static readonly Heights = 'Heights';
	static readonly hideItem = 'hideItem';
	static readonly room = 'room';
	static readonly points = 'points';
	static readonly ball = 'ball';
	static readonly hashes = 'hashes';
}

export class GameRoom {
	static readonly MoveDistance: number = 10;
	public ball: Ball;
	public WatcherIds: number[];
	constructor (public room_number: number, public server:any, public player1: Player, public player2: Player, public hashes: number[], public userIdToInfo: Map<number,ClientInfo>) {
	  this.ball = new Ball(player1.id); // todo?
	  this.WatcherIds = [];
	  this.initClientInfos();
	}

	sendToPlayers(event: string, json: string) {
		this.server.to(this.player1.id).to(this.player2.id).emit(event, json);
	}

	sendToWatchers(event: string, json: string) {
		for (let i = 0 ; i < this.WatcherIds.length ; ++i) {
			this.server.to(this.WatcherIds[i]).emit(event, json);
		}
	}

	sendToAll(event: string, json: string) {
		this.sendToPlayers(event, json);
		this.sendToWatchers(event, json);
	}

	initClientInfos() {
		if (!this.userIdToInfo[this.player1.id])
			this.userIdToInfo[this.player1.id] = new ClientInfo(this.server, this.player1.id);
		if (!this.userIdToInfo[this.player2.id])
			this.userIdToInfo[this.player2.id] = new ClientInfo(this.server, this.player2.id);

		for (let i = 0 ; i < this.WatcherIds.length ; ++i) {
			if (!this.userIdToInfo[this.WatcherIds[i]])
				this.userIdToInfo[this.WatcherIds[i]] = new ClientInfo(this.server, this.WatcherIds[i]);
		}
	}

	modifyPlayers(type: string, info: any) { // todo
		if (!this.userIdToInfo[this.player1.id])
			this.userIdToInfo[this.player1.id] = new ClientInfo(this.server, this.player1.id);
		if (!this.userIdToInfo[this.player2.id])
			this.userIdToInfo[this.player2.id] = new ClientInfo(this.server, this.player2.id);

		let player1Info = this.userIdToInfo[this.player1.id];
		let player2Info = this.userIdToInfo[this.player2.id];

		switch(type) {
			case ModifyAttributes.Logins:
				player1Info.modify_Logins(info);
				player2Info.modify_Logins(info);
				break ;
			case ModifyAttributes.hideItem:
				if (info.length != 2) {
					console.log('Error: Wrong info length in ModifyAttributes.hideItem');
				}
				else {
					player1Info.modify_hideItem(info[0],info[1]);
					player2Info.modify_hideItem(info[0],info[1]);
				}
				break ;
			case ModifyAttributes.Heights:
				if (info.length != 2) {
					console.log('Error: Wrong info length in ModifyAttributes.Heights');
				}
				else {
					player1Info.modify_heights(info[0],info[1]);
					player2Info.modify_heights(info[0],info[1]);
				}
				break ;
			case ModifyAttributes.room:
				player1Info.modify_room(info);
				player2Info.modify_room(info);
				break ;
			case ModifyAttributes.points:
				if (info.length != 2) {
					console.log('Error: Wrong info length in ModifyAttributes.points');
				}
				else {
					player1Info.modify_points(info[0],info[1]);
					player2Info.modify_points(info[0],info[1]);
				}
				break ;
			case ModifyAttributes.ball:
				if (info.length != 2)
					console.log('Error: Wrong info length in ModifyAttributes.ball');
				else {
					player1Info.modify_ball(info[0],info[1]);
					player2Info.modify_ball(info[0],info[1]);
				}
				break ;
			case ModifyAttributes.hashes:
				if (info.length != 2)
					console.log('Error: Wrong info length in ModifyAttributes.hashes');
				else {
					player1Info.modify_hashes(info[0],info[1]);
					player2Info.modify_hashes(info[0],info[1]);
				}
				break ;
			default:
				console.log('Error: Unknown type in GameRoom.ModifyWatchers');
		}

	}

	modifyWatchers(type: string, info: any) { // todo
		for (let i = 0 ; i < this.WatcherIds.length ; ++i) {
			if (!this.userIdToInfo[this.WatcherIds[i]])
				this.userIdToInfo[this.WatcherIds[i]] = new ClientInfo(this.server, this.WatcherIds[i]);
			let tmp: ClientInfo = this.userIdToInfo[this.WatcherIds[i]];

			switch(type) {
				case ModifyAttributes.Logins:
					tmp.modify_Logins(info);
					break ;
				case ModifyAttributes.hideItem:
					if (info.length != 2) {
						console.log('Error: Wrong info length in ModifyAttributes.hideItem');
					}
					else
						tmp.modify_hideItem(info[0],info[1]);
					break ;
				case ModifyAttributes.Heights:
					if (info.length != 2) {
						console.log('Error: Wrong info length in ModifyAttributes.Heights');
					}
					else
						tmp.modify_heights(info[0],info[1]);
					break ;
				case ModifyAttributes.room:
					tmp.modify_room(info);
					break ;
				case ModifyAttributes.points:
					if (info.length != 2) {
						console.log('Error: Wrong info length in ModifyAttributes.points');
					}
					else
						tmp.modify_points(info[0],info[1]);
					break ;
				case ModifyAttributes.ball:
					if (info.length != 2) {
						console.log('Error: Wrong info length in ModifyAttributes.ball');
					}
					else
						tmp.modify_ball(info[0],info[1]);
					break ;
				case ModifyAttributes.hashes:
					if (info.length != 2) {
						console.log('Error: Wrong info length in ModifyAttributes.hashes');
					}
					else
						tmp.modify_hashes(info[0],info[1]);
					break ;
				default:
					console.log('Error: Unknown type in GameRoom.ModifyWatchers');
			}
		}
	}

	modifyAll(type: string, info: any) { // todo
		this.modifyPlayers(type, info);
		this.modifyWatchers(type, info);
	}

}
