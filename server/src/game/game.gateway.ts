import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Mutex } from 'async-mutex';
import { Player } from './utils/player';
import { ConstValues } from './utils/const-values';
import { Response } from './utils/response';
import { Ball } from './utils/ball';
import { GameRoom, ModifyAttributes } from './utils/game-room';
import { HistoryService } from './history/history.service';
import { ClientInfo } from './utils/client-info';
import { competitionEnumerator, customizationEnumerator } from './utils/enumerators';

@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] }})
export class GameGateway implements OnGatewayConnection {
  @WebSocketServer() server;

  waiting_clients = [];
  mutex: Mutex;
  room_mutex: Mutex;
  UserIdToLogin: Map<number, string>;
  UserIdToInfo: Map<number, ClientInfo>;
  gameRooms: GameRoom[];

  constructor(public historyService: HistoryService) {
    this.room_mutex = new Mutex();
    this.mutex = new Mutex();
    this.UserIdToLogin = new Map<number,string>();
    this.UserIdToInfo = new Map<number,ClientInfo>();
    this.gameRooms = [];
  }

  handleConnection(client: any, ...args: any[]) {
  }

  @SubscribeMessage('GameConnect')
  async Connect(client, [userId, userLogin]) {
    userId = parseInt(userId);
    client.join(userId);
    this.UserIdToLogin[userId] = userLogin;
    if (!this.UserIdToInfo[userId]) {
      this.UserIdToInfo[userId] = new ClientInfo(this.server, userId);
    }
    this.server.to(client.id).emit(ConstValues.ClientInfo, JSON.stringify(this.UserIdToInfo[userId].getJSON()));
  }

  @SubscribeMessage('GameDisconnect')
  async Disconnect(client, userId) {
    userId = parseInt(userId);
    client.leave(userId);
  }

  async setGameReady(player1_id: number, player2_id: number, hashes: number[]) { // ok
    let player1 = new Player(player1_id, this.UserIdToLogin[player1_id], true),
        player2 = new Player(player2_id, this.UserIdToLogin[player2_id], false);
    
    const release = await this.room_mutex.acquire();
    let room_number = this.gameRooms.length;
    let gameRoom = new GameRoom(room_number, this.server, player1, player2, hashes,this.UserIdToInfo);
    this.gameRooms.push(gameRoom);
    gameRoom.modifyPlayers(ModifyAttributes.Logins, [player1.login, player2.login]);
    gameRoom.modifyPlayers(ModifyAttributes.hideItem, [[0,4],[true,false]]);
    gameRoom.modifyPlayers(ModifyAttributes.Heights, [[0,1],[player1.height,player2.height]]);
    gameRoom.modifyPlayers(ModifyAttributes.room,room_number);
    gameRoom.modifyPlayers(ModifyAttributes.hashes, [[0,1],hashes]);
    release();

    gameRoom.modifyAll(ModifyAttributes.points, [[0,1],[player1.point, player2.point]]);
    gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[gameRoom.ball.x, gameRoom.ball.y]]);

    this.historyService.GameStart(gameRoom);
}

  async moveBall(room_number: number) { // ok
    let gameRoom = this.gameRooms[room_number];
    let ball = gameRoom.ball;
    let player1 = gameRoom.player1;
    let player2 = gameRoom.player2;
    
    const minX = ConstValues.paddleWidth;
    const maxX = ConstValues.canvasWidth - ConstValues.ballWidth - ConstValues.paddleWidth;
    const minY = 0;
    const maxY = ConstValues.canvasHeight - ConstValues.ballHeight;
    const interval = setInterval(()=>{
      if (player1.point < 0 || player2.point < 0) {
        clearInterval(interval);
        return ;
      }
      ball.x += ball.vx;
      ball.y += ball.vy;
      if (ball.y < minY) {
        ball.y = 2 * minY - ball.y;
        ball.vy *= -1;
      }
      else if (ball.y > maxY) {
        ball.y = 2 * maxY - ball.y;
        ball.vy *= -1;
      }
      if (ball.x < minX) {
        if ((ball.y + ConstValues.ballHeight >= player1.height) && (ball.y <= player1.height + ConstValues.paddleHeight) ) {
          ball.x = 2 * minX - ball.x;
          ball.vx *= -1;
        } 
        else {
          ++(player2.point);
          gameRoom.modifyAll(ModifyAttributes.points, [[1],[player2.point]]);
          if (player2.point >= ConstValues.WinningPoint) {
            ball.destroy();
            gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ConstValues.canvasWidth,ConstValues.canvasHeight]]);
            gameRoom.modifyAll(ModifyAttributes.hideItem,[[1,3],[false,false]]);
            this.historyService.GameFinish(gameRoom);
          }
          else {
            player1.init();
            player2.init();
            ball.init(player1.id);
            player1.carryBall = true;
            gameRoom.modifyAll(ModifyAttributes.Heights, [[0,1],[player1.height, player2.height]]);
            gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ball.x, ball.y]]);
          }
          clearInterval(interval);
          return ;
        }
      }
      else if (ball.x > maxX) {
        if ((ball.y + ConstValues.ballHeight >= player2.height) && (ball.y <= player2.height + ConstValues.paddleHeight) ) {
          ball.x = 2 * maxX - ball.x;
          ball.vx *= -1;
        }
        else {
          ++(player1.point);
          gameRoom.modifyAll(ModifyAttributes.points, [[0],[player1.point]]);
          if (player1.point >= ConstValues.WinningPoint) {
            ball.destroy();
            gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ConstValues.canvasWidth,ConstValues.canvasHeight]]);
            gameRoom.modifyAll(ModifyAttributes.hideItem, [[1,3],[false,false]]);
            this.historyService.GameFinish(gameRoom);
          }
          else {
            player1.init();
            player2.init();
            ball.init(player2.id);
            player2.carryBall = true;
            gameRoom.modifyAll(ModifyAttributes.Heights,[[0,1],[player1.height,player2.height]]);
            gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ball.x, ball.y]]);
          }
          clearInterval(interval);
          return ;
        }
      }
      gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ball.x, ball.y]]);
    }, ConstValues.animationFrameRate);
  }

  @SubscribeMessage('PlayerMove')
  async movePlayer(client, [room_number, id, direction]) { // ok
    room_number = parseInt(room_number);
    id = parseInt(id);

    let gameRoom = this.gameRooms[room_number];
    let ball = gameRoom.ball;
    let player1 = gameRoom.player1;
    let player2 = gameRoom.player2;
    
    if (direction == 'space') {
      if ( ball.isCarried && id == ball.ballCarrierId ) {
        player1.carryBall = false;
        player2.carryBall = false;
        ball.isCarried = false;
        this.moveBall(room_number);
      }
      return ;
    }
    if (direction == 'left') {
      if ( (id == player1.id || id == player2.id ) && customizationEnumerator['speed'] == gameRoom.hashes[1] && !ball.isCarried) {
        --ball.vx;
      }
      return ;
    }
    if (direction == 'right') {
      if ( (id == player1.id || id == player2.id ) && customizationEnumerator['speed'] == gameRoom.hashes[1] && !ball.isCarried) {
        ++ball.vx;
      }
      return ;
    }

    if (id == player1.id) {
      switch (direction) {
        case 'up':
          player1.height -= GameRoom.MoveDistance;
          if (player1.height < 0)
            player1.height = 0;
          break ;
        case 'down':
          player1.height += GameRoom.MoveDistance;
          if (player1.height > ConstValues.canvasHeight - ConstValues.paddleHeight)
            player1.height = ConstValues.canvasHeight - ConstValues.paddleHeight;
          break ;
        default:
          console.log('ClientError: Invalid PlayerMove direction ' + direction);
      }
      if (player1.carryBall) {
        ball.y = player1.height + ConstValues.paddleHeight / 2 - ConstValues.ballHeight / 2;
        gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ball.x, ball.y]]);
      }
      gameRoom.modifyAll(ModifyAttributes.Heights,[[0],[player1.height]]);
    }
    else if (id == player2.id) {
      switch (direction) {
        case 'up':
          player2.height -= GameRoom.MoveDistance;
          if (player2.height < 0)
            player2.height = 0;
          break ;
        case 'down':
          player2.height += GameRoom.MoveDistance;
          if (player2.height > ConstValues.canvasHeight - ConstValues.paddleHeight)
            player2.height = ConstValues.canvasHeight - ConstValues.paddleHeight;
          break ;
        default:
          console.log('ClientError: Invalid PlayerMove direction ' + direction);
      }
      if (player2.carryBall) {
        ball.y = player2.height + ConstValues.paddleHeight / 2 - ConstValues.ballHeight / 2;
        gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ball.x, ball.y]]);
      }
      gameRoom.modifyAll(ModifyAttributes.Heights,[[1],[player2.height]]);
    }
  }

  @SubscribeMessage('Special')
  async speicalEvent(client, [room_number, id, information]) { // ok
    room_number = parseInt(room_number);
    id = parseInt(id);
    let gameRoom = this.gameRooms[room_number];
    if (information == 'Surrender') {
      let player1: Player = gameRoom.player1, player2: Player = gameRoom.player2;
      if (player1.id == id) {
        player1.point = -42;
        gameRoom.modifyAll(ModifyAttributes.points, [[0],[player1.point]]);
        this.historyService.GameFinish(gameRoom);
      }
      else if (player2.id == id) {
        player2.point = -42;
        gameRoom.modifyAll(ModifyAttributes.points, [[1],[player2.point]]);
        this.historyService.GameFinish(gameRoom); 
      }
      else return ;
      
      gameRoom.ball.destroy();
      gameRoom.modifyAll(ModifyAttributes.ball, [[0,1],[ConstValues.canvasWidth,ConstValues.canvasHeight]]);
      gameRoom.modifyAll(ModifyAttributes.hideItem,[[1,3],[false,false]]);
    }
    else {
      console.log('Unknown special event');
    }
  }

  possibleHash( compHash: number[], custHash: number[] ) {
    let ret:number[] = [-1,-1];
    if (compHash.length != 2 || custHash.length != 2) {
      console.log('Error while hashing');
      return ret;
    }
    if (compHash[0] == competitionEnumerator['any'] && compHash[1] == competitionEnumerator['any']) {
      ret[0] = competitionEnumerator['normal'];
    }
    else if (compHash[0] == competitionEnumerator['any']) {
      ret[0] = compHash[1];
    }
    else if (compHash[1] == competitionEnumerator['any']) {
      ret[0] = compHash[0];
    }
    else if (compHash[0] == compHash[1]) {
      ret[0] = compHash[0];
    }
    else {
      return ret;
    }

    if (custHash[0] == customizationEnumerator['any'] && custHash[1] == customizationEnumerator['any'] ) {
      ret[1] = customizationEnumerator['normal'];
    }
    else if (custHash[0] == customizationEnumerator['any']) {
      ret[1] = custHash[1];
    }
    else if (custHash[1] == customizationEnumerator['any']) {
      ret[1] = custHash[0];
    }
    else if (custHash[0] == custHash[1]) {
      ret[1] = custHash[0];
    }

    return ret;
  }

  @SubscribeMessage('RoomRequest')
  async match(client, [id, competitionHash, customizationHash]) { // ok
    id = parseInt(id);
    competitionHash = parseInt(competitionHash);
    customizationHash = parseInt(customizationHash);
    if ( competitionEnumerator[competitionHash] === undefined || customizationEnumerator[customizationHash] === undefined) {
      console.log('ErrorInMatch');
      console.log(competitionHash);
      console.log(customizationHash);
      return ;
    }

    
    if (!this.UserIdToInfo[id])
      this.UserIdToInfo[id] = new ClientInfo(this.server, id);
    this.UserIdToInfo[id].modify_hideItem([2],[false]);

    const release = await this.mutex.acquire();
    let len = this.waiting_clients.length;
    for (let i = 0 ; i  < len; ++i) {
      if (this.waiting_clients[i][0] == id) {
        console.log('ErrorInMatch');
        console.log(this.waiting_clients);
        console.log(id);
        release();
        return ;
      }
    }

    for (let i = 0 ; i < len ; ++i) {
      let hashes = this.possibleHash([competitionHash, this.waiting_clients[i][1]], [customizationHash, this.waiting_clients[i][2]]);
      if (hashes[0] == -1 || hashes[1] == -1)
        continue ;
      let opponent = this.waiting_clients[i];
      this.waiting_clients.splice(i, 1);
      release();
      this.setGameReady( opponent[0], id , hashes);
      return ;
    }

    this.waiting_clients.push([id, competitionHash, customizationHash]);
    release();
  }

  @SubscribeMessage('WatchRequest')
  async watch(client, [room_number, id]) { // ok
    id = parseInt(id);
    room_number = parseInt(room_number);
    if (!this.UserIdToInfo[id])
      this.UserIdToInfo[id] = new ClientInfo(this.server, id);


    if (room_number != NaN && room_number < this.gameRooms.length) {
      let gameRoom = this.gameRooms[room_number];
      let info: ClientInfo = this.UserIdToInfo[id];
      info.modify_Logins([gameRoom.player1.login, gameRoom.player2.login]);
      info.modify_hideItem([0,3,5],[true,true,false]);
      info.modify_room(room_number);
      info.modify_heights([0,1],[gameRoom.player1.height,gameRoom.player2.height]);
      info.modify_ball([0,1],[gameRoom.ball.x, gameRoom.ball.y]);
      info.modify_points([0,1],[gameRoom.player1.point,gameRoom.player2.point]);
      info.modify_hashes([0,1],gameRoom.hashes);
      gameRoom.WatcherIds.push(id);
    }
    else {
      this.server.to(client.id).emit(ConstValues.WatchResponse, JSON.stringify(new Response('Watch', {status: 'Refused'}).getJSON()));
    }
  }

  @SubscribeMessage('LeaveGameRoom')
  async LeaveGame(client, userId) {
    userId = parseInt(userId);
    if (!this.UserIdToInfo[userId])
      this.UserIdToInfo[userId] = new ClientInfo(this.server, userId);
    this.UserIdToInfo[userId].modify_hideItem([0,4,5,1,2],[false,true,true,true,true]);
    this.UserIdToInfo[userId].modify_room(-1);
  }

  @SubscribeMessage('LeaveWatching')
  async leaveWatching(client, [room_number, id]) { // ok
    room_number = parseInt(room_number);
    id = parseInt(id);
    if (room_number != NaN && room_number < this.gameRooms.length) {
      let gameRoom = this.gameRooms[room_number];
      let index = gameRoom.WatcherIds.indexOf(id);
      if (index > -1) {
        gameRoom.WatcherIds.splice(index, 1);
      }
    }

    if (!this.UserIdToInfo[id])
      this.UserIdToInfo[id] = new ClientInfo(this.server, id);
    this.UserIdToInfo[id].modify_hideItem([3,0,4,5,1,2],[false,false,true,true,true,true]);
    this.UserIdToInfo[id].modify_room(-1);

  }

  @SubscribeMessage('CancelRoom')
  async cancelRoomRequest(client, id) { // ok
    id = parseInt(id);
    const release = await this.mutex.acquire();
    for (let i = 0 ; i < this.waiting_clients.length ; ++i) {
      if (this.waiting_clients[i][0] == id) {
        this.waiting_clients.splice(i, 1);
      }
    }
    release();
    if (!this.UserIdToInfo[id])
      this.UserIdToInfo[id] = new ClientInfo(this.server, id);
    this.UserIdToInfo[id].modify_hideItem([2],[true]);
  }
  
}
