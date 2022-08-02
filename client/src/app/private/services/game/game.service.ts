import { Injectable } from '@angular/core';
import { CustomSocket } from '../../sockets/custom-sockets';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(public socket: CustomSocket) { }

  getRoomResponse() {
    return this.socket.fromEvent('RoomResponse');
  }
  sendRoomRequest(userLogin: string) {
    this.socket.emit('RoomRequest', userLogin);
  }

  sendCancelRequest(userLogin: string) {
    this.socket.emit('CancelRoom', userLogin);
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

  sendSurrender(room: number, login: string) {
    this.socket.emit('Special', [room, login, 'Surrender']);
  }

  sendWatchRequest(room: string, login: string) {
    this.socket.emit('WatchRequest', [room, login]);
  }

  sendLeaveWatching(room: string, login: string) {
    this.socket.emit('LeaveWatching', [room,login]);
  }

  getWatchResponse() {
    return this.socket.fromEvent('WatchResponse');
  }

  sendGameConnect(userId: number, userLogin: string) {
    this.socket.emit('GameConnect', [userId, userLogin]);
  }

  sendGameDisconnect(userId: number) {
    this.socket.emit('GameDisconnect', userId);
  }

}
