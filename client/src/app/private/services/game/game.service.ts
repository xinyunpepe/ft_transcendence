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
  sendRoomRequest(userId: number) {
    this.socket.emit('RoomRequest', userId);
  }

  sendCancelRequest(userId: number) {
    this.socket.emit('CancelRoom', userId);
  }

  getGameStatus() {
    return this.socket.fromEvent('GameStatus');
  }

  getPlayerInformation() {
    return this.socket.fromEvent('Player');
  }

  sendPlayerMove(room: number, userId: number, direction: string) {
    this.socket.emit('PlayerMove', [room, userId, direction]);
  }

  getBallInformation() {
    return this.socket.fromEvent('Ball');
  }

  sendSurrender(room: number, userId: number) {
    this.socket.emit('Special', [room, userId, 'Surrender']);
  }

  sendWatchRequest(room: string, userId: number) {
    this.socket.emit('WatchRequest', [room, userId]);
  }

  sendLeaveWatching(room: string, userId: number) {
    this.socket.emit('LeaveWatching', [room, userId]);
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

  getClientInfo() {
    return this.socket.fromEvent('ClientInfo');
  }

}
