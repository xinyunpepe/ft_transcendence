import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private socket: Socket) { }
  
  getRoomResponse() {
    return this.socket.fromEvent('RoomResponse');
  }
  sendRoomRequest(from: number, to: number) {
    this.socket.emit('RoomRequest', [from, to]);
  }

  getGameStatus() {
    return this.socket.fromEvent('GameStatus');
  }

  getPlayerInformation() {
    return this.socket.fromEvent('Player');
  }

  sendPlayerMove(room: number, id: number, direction: string) {
    this.socket.emit('PlayerMove', [room, id, direction]);
  }

  getBallInformation() {
    return this.socket.fromEvent('Ball');
  }

}
