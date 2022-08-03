import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Mutex } from 'async-mutex';
import { Player } from './utils/player';
import { ConstValues } from './utils/const-values';
import { Response } from './utils/response';
import { Ball } from './utils/ball';
import { GameRoom, ModifyAttributes } from './utils/game-room';
import { HistoryService } from './history/history.service';
import { ClientInfo } from './utils/client-info';

@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] }})
export class GameGateway {
  @WebSocketServer() server;

  waiting_clients = []
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

  async setGameReady(player1_id: number, player2_id: number) { // ok
    let player1 = new Player(player1_id, this.UserIdToLogin[player1_id], true),
        player2 = new Player(player2_id, this.UserIdToLogin[player2_id], false);
    
    // if (!this.UserIdToInfo[player1_id]) {
    //   this.UserIdToInfo[player1_id] = new ClientInfo(this.server, player1_id);
    // }
    // if (!this.UserIdToInfo[player2_id]) {
    //   this.UserIdToInfo[player2_id] = new ClientInfo(this.server, player2_id);
    // }

    // let player1Info: ClientInfo = this.UserIdToInfo[player1_id];
    // let player2Info: ClientInfo = this.UserIdToInfo[player2_id];
    // player1Info.modify_Logins([player1.login, player2.login]);
    // player1Info.modify_hideItem([0,4],[true,false]);
    // player1Info.modify_heights([0,1],[player1.height,player2.height]);
    // player2Info.modify_Logins([player1.login, player2.login]);
    // player2Info.modify_hideItem([0,4],[true,false]);
    // player2Info.modify_heights([0,1],[player1.height,player2.height]);
    
    const release = await this.room_mutex.acquire();
    let gameRoom = new GameRoom(this.server, player1, player2, this.UserIdToInfo);
    let room_number = this.gameRooms.length;
    this.gameRooms.push(gameRoom);
    gameRoom.modifyPlayers(ModifyAttributes.Logins, [player1.login, player2.login]);
    gameRoom.modifyPlayers(ModifyAttributes.hideItem, [[0,4],[true,false]]);
    gameRoom.modifyPlayers(ModifyAttributes.Heights, [[0,1],[player1.height,player2.height]]);
    gameRoom.modifyPlayers(ModifyAttributes.room,room_number);
    release();
    // player1Info.modify_room(room_number);
    // player2Info.modify_room(room_number);

    let response = new Response('Room', 'Matched');
    gameRoom.sendToPlayers(ConstValues.RoomResponse,  JSON.stringify(response.getJSON()));
    gameRoom.sendToAll(ConstValues.Player, JSON.stringify(player1.getJSON()));
    gameRoom.sendToAll(ConstValues.Player, JSON.stringify(player2.getJSON()));
    gameRoom.sendToAll(ConstValues.Ball, JSON.stringify(gameRoom.ball.getJSON()));

    response.type = 'Game';
    response.content = {
      status: 'Ready'    };

    gameRoom.sendToAll(ConstValues.GameStatus, JSON.stringify(response.getJSON()));
    this.historyService.GameStart(player1.id, player2.id);
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
          gameRoom.sendToAll(ConstValues.Player, JSON.stringify(player2.getJSON()));
          if (player2.point >= ConstValues.WinningPoint) {
            ball.destroy();
            gameRoom.sendToAll( ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
            // if (!this.UserIdToInfo[player1.id])
            //   this.UserIdToInfo[player1.id] = new ClientInfo(this.server, player1.id);
            // if (!this.UserIdToInfo[player2.id])
            //   this.UserIdToInfo[player2.id] = new ClientInfo(this.server, player2.id);

            // let player1Info: ClientInfo = this.UserIdToInfo[player1.id];
            // let player2Info: ClientInfo = this.UserIdToInfo[player2.id];
            // player1Info.modify_hideItem([1,3],[false,false]);
            // player2Info.modify_hideItem([1,3],[false,false]);
            gameRoom.modifyAll(ModifyAttributes.hideItem,[[1,3],[false,false]]);
            this.historyService.GameFinish(room_number, player2, player1);
          }
          else {
            player1.init();
            player2.init();
            ball.init(player1.id);
            player1.carryBall = true;
            // if (!this.UserIdToInfo[player1.id])
            //   this.UserIdToInfo[player1.id] = new ClientInfo(this.server, player1.id);
            // if (!this.UserIdToInfo[player2.id])
            //   this.UserIdToInfo[player2.id] = new ClientInfo(this.server, player2.id);

            // let player1Info: ClientInfo = this.UserIdToInfo[player1.id];
            // let player2Info: ClientInfo = this.UserIdToInfo[player2.id];
            // player1Info.modify_heights([0,1],[player1.height,player2.height]);
            // player2Info.modify_heights([0,1],[player1.height,player2.height]);
            gameRoom.modifyAll(ModifyAttributes.Heights, [[0,1],[player1.height, player2.height]]);

            gameRoom.sendToAll(ConstValues.Player, JSON.stringify(player1.getJSON()));
            gameRoom.sendToAll(ConstValues.Player, JSON.stringify(player2.getJSON()));
            gameRoom.sendToAll(ConstValues.Ball, JSON.stringify(ball.getJSON()));
            gameRoom.sendToAll(ConstValues.GameStatus, JSON.stringify((new Response('Game',  {status: 'Ready'})).getJSON()));
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
          gameRoom.sendToAll( ConstValues.Player, JSON.stringify(player1.getJSON()));
          if (player1.point >= ConstValues.WinningPoint) {
            ball.destroy();
            gameRoom.sendToAll( ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
            // if (!this.UserIdToInfo[player1.id])
            //   this.UserIdToInfo[player1.id] = new ClientInfo(this.server, player1.id);
            // if (!this.UserIdToInfo[player2.id])
            //   this.UserIdToInfo[player2.id] = new ClientInfo(this.server, player2.id);

            // let player1Info: ClientInfo = this.UserIdToInfo[player1.id];
            // let player2Info: ClientInfo = this.UserIdToInfo[player2.id];
            // player1Info.modify_hideItem([1,3],[false,false]);
            // player2Info.modify_hideItem([1,3],[false,false]);
            gameRoom.modifyAll(ModifyAttributes.hideItem, [[1,3],[false,false]]);
            this.historyService.GameFinish(room_number, player1, player2);
          }
          else {
            player1.init();
            player2.init();
            ball.init(player2.id);
            player2.carryBall = true;
            // if (!this.UserIdToInfo[player1.id])
            //   this.UserIdToInfo[player1.id] = new ClientInfo(this.server, player1.id);
            // if (!this.UserIdToInfo[player2.id])
            //   this.UserIdToInfo[player2.id] = new ClientInfo(this.server, player2.id);

            // let player1Info: ClientInfo = this.UserIdToInfo[player1.id];
            // let player2Info: ClientInfo = this.UserIdToInfo[player2.id];
            // player1Info.modify_heights([0,1],[player1.height,player2.height]);
            // player2Info.modify_heights([0,1],[player1.height,player2.height]);
            
            gameRoom.modifyAll(ModifyAttributes.Heights,[[0,1],[player1.height,player2.height]]);

            gameRoom.sendToAll( ConstValues.Player, JSON.stringify(player1.getJSON()));
            gameRoom.sendToAll( ConstValues.Player, JSON.stringify(player2.getJSON()));
            gameRoom.sendToAll( ConstValues.Ball, JSON.stringify(ball.getJSON()));
            gameRoom.sendToAll( ConstValues.GameStatus, JSON.stringify((new Response('Game',  {status: 'Ready'})).getJSON()));
          }
          clearInterval(interval);
          return ;
        }
      }
      gameRoom.sendToAll( ConstValues.Ball, JSON.stringify(ball.getJSON()));
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
        gameRoom.sendToAll( ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Start'}).getJSON())));
        player1.carryBall = false;
        player2.carryBall = false;
        ball.isCarried = false;
        this.moveBall(room_number);
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
        gameRoom.sendToAll( ConstValues.Ball, JSON.stringify(ball.getJSON()));
      }
      // if (!this.UserIdToInfo[player1.id])
      //   this.UserIdToInfo[player1.id] = new ClientInfo(this.server, player1.id);
      // if (!this.UserIdToInfo[player2.id])
      //   this.UserIdToInfo[player2.id] = new ClientInfo(this.server, player2.id);

      // let player1Info: ClientInfo = this.UserIdToInfo[player1.id];
      // let player2Info: ClientInfo = this.UserIdToInfo[player2.id];
      // player1Info.modify_heights([0,1],[player1.height,player2.height]);
      // player2Info.modify_heights([0,1],[player1.height,player2.height]);
      gameRoom.modifyAll(ModifyAttributes.Heights,[[0],[player1.height]]);
      gameRoom.sendToAll( ConstValues.Player, JSON.stringify(player1.getJSON()));
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
        gameRoom.sendToAll( ConstValues.Ball, JSON.stringify(ball.getJSON()));
      }

      // if (!this.UserIdToInfo[player1.id])
      //   this.UserIdToInfo[player1.id] = new ClientInfo(this.server, player1.id);
      // if (!this.UserIdToInfo[player2.id])
      //   this.UserIdToInfo[player2.id] = new ClientInfo(this.server, player2.id);

      // let player1Info: ClientInfo = this.UserIdToInfo[player1.id];
      // let player2Info: ClientInfo = this.UserIdToInfo[player2.id];
      // player1Info.modify_heights([0,1],[player1.height,player2.height]);
      // player2Info.modify_heights([0,1],[player1.height,player2.height]);
      gameRoom.modifyAll(ModifyAttributes.Heights,[[1],[player2.height]]);
      gameRoom.sendToAll( ConstValues.Player, JSON.stringify(player2.getJSON()));
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
        gameRoom.sendToAll( ConstValues.Player, JSON.stringify(player1.getJSON()));
        this.historyService.GameFinish(room_number, player2, player1);
      }
      else if (player2.id == id) {
        player2.point = -42;
        gameRoom.sendToAll( ConstValues.Player, JSON.stringify(player2.getJSON()));
        this.historyService.GameFinish(room_number, player1, player2); 
      }
      else return ;
      
      gameRoom.ball.destroy();
      gameRoom.sendToAll( ConstValues.Ball, JSON.stringify(gameRoom.ball.getJSON()));
      gameRoom.sendToAll( ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
      
      // if (!this.UserIdToInfo[player1.id])
      //   this.UserIdToInfo[player1.id] = new ClientInfo(this.server, player1.id);
      // if (!this.UserIdToInfo[player2.id])
      //   this.UserIdToInfo[player2.id] = new ClientInfo(this.server, player2.id);

      // let player1Info: ClientInfo = this.UserIdToInfo[player1.id];
      // let player2Info: ClientInfo = this.UserIdToInfo[player2.id];
      // player1Info.modify_hideItem([1,3],[false,false]);
      // player2Info.modify_hideItem([1,3],[false,false]);
      gameRoom.modifyAll(ModifyAttributes.hideItem,[[1,3],[false,false]]);
    }
    else {
      console.log('Unknown special event');
    }
  }

  @SubscribeMessage('RoomRequest')
  async match(client, id) { // ok
    id = parseInt(id);
    let response = new Response('Room');
    if (!this.UserIdToInfo[id])
      this.UserIdToInfo[id] = new ClientInfo(this.server, id);
    this.UserIdToInfo[id].modify_hideItem([2],[false]);

    const release = await this.mutex.acquire();
    if (this.waiting_clients.indexOf(id) != -1) {
      response.content = 'Duplicate';
    }
    else {
      let len = this.waiting_clients.length;
      if (len > 0) {
        let opponent = this.waiting_clients.pop();
        release();
        this.setGameReady( opponent, id );
        return ;
      }
      else {
        this.waiting_clients.push(id);
        response.content = 'Waiting';
      }
    }
    release();
    this.server.to(id).emit('RoomResponse', JSON.stringify(response.getJSON()));
  }

  @SubscribeMessage('WatchRequest')
  async watch(client, [room_number, id]) { // ok
    id = parseInt(id);
    room_number = parseInt(room_number);
    if (!this.UserIdToInfo[id])
      this.UserIdToInfo[id] = new ClientInfo(this.server, id);

    let response = new Response('Watch');

    if (room_number != NaN && room_number < this.gameRooms.length) {
      let gameRoom = this.gameRooms[room_number];
      let info: ClientInfo = this.UserIdToInfo[id];
      info.modify_Logins([gameRoom.player1.login, gameRoom.player2.login]);
      info.modify_hideItem([0,3,5],[true,true,false]);
      info.modify_room(room_number);
      info.modify_heights([0,1],[gameRoom.player1.height,gameRoom.player2.height]);
      response.content = { status: 'Accepted' };
      

      this.server.to(id).emit(ConstValues.Player, JSON.stringify(gameRoom.player1.getJSON()));
      this.server.to(id).emit(ConstValues.Player, JSON.stringify(gameRoom.player2.getJSON()));
      this.server.to(id).emit(ConstValues.Ball, JSON.stringify(gameRoom.ball.getJSON()));  
      gameRoom.WatcherIds.push(id);
    }
    else {
      response.content = { status: 'Refused' };
    }
    this.server.to(id).emit(ConstValues.WatchResponse, JSON.stringify(response.getJSON()));
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
    let index = this.waiting_clients.indexOf(id);
    if (index > -1) {
      this.waiting_clients.splice(index, 1);
    }
    release();
    if (!this.UserIdToInfo[id])
      this.UserIdToInfo[id] = new ClientInfo(this.server, id);
    this.UserIdToInfo[id].modify_hideItem([2],[true]);
  }
  
}
