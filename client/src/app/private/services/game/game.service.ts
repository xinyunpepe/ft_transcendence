import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HistoryI } from 'src/app/model/history.interface';
import { MatchI } from 'src/app/model/match.interface';
import { environment } from 'src/environments/environment';
import { CustomSocket } from '../../sockets/custom-sockets';
import { competitionEnumerator, customizationEnumerator } from './enumerators';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(public socket: CustomSocket) { }

  sendRoomRequest(userId: number, competitionType: string, gameCustomization: string) {
    this.socket.emit('RoomRequest', [userId,competitionEnumerator[competitionType],customizationEnumerator[gameCustomization]]);
  }

  sendCancelRequest(userId: number) {
    this.socket.emit('CancelRoom', userId);
  }


  sendPlayerMove(room: number, userId: number, direction: string) {
    this.socket.emit('PlayerMove', [room, userId, direction]);
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

  sendLeaveGameRoom(userId: number) {
    this.socket.emit('LeaveGameRoom', userId);
  }
}
