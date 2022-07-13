import { Injectable } from '@angular/core';
import { CustomSocket } from '../../sockets/custom-sockets';
// import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(public socket: CustomSocket) { }

  getRoomResponse() {
    return this.socket.fromEvent('RoomResponse');
  }
  sendRoomRequest(from: string, to: string) {
    this.socket.emit('RoomRequest', [from, to]);
  }

  getGameStatus() {
    return this.socket.fromEvent('GameStatus');
  }

  getPlayerInformation() {
    return this.socket.fromEvent('Player');
  }

  sendPlayerMove(room: number, login: string, direction: string) {
    this.socket.emit('PlayerMove', [room, login, direction]);
  }

  getBallInformation() {
    return this.socket.fromEvent('Ball');
  }

}
