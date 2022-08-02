import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Mutex } from 'async-mutex';
import { Player } from './utils/player';
import { ConstValues } from './utils/const-values';
import { Response } from './utils/response';
import { Ball } from './utils/ball';
import { GameRoom } from './utils/game-room';
import { HistoryService } from './history/history.service';


@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] }})
export class GameGateway {
  @WebSocketServer() server;

  waiting_clients = []
  mutex: Mutex;
  room_mutex: Mutex;
  UserIdToLogin: Map<number, string>;
  gameRooms: GameRoom[];

  constructor(public historyService: HistoryService) {
    this.room_mutex = new Mutex();
    this.mutex = new Mutex();
    this.UserIdToLogin = new Map<number,string>();
    this.gameRooms = [];
  }

  @SubscribeMessage('GameConnect')
  async Connect(client, [userId, userLogin]) {
    userId = parseInt(userId);
    client.join(userId);
    this.UserIdToLogin[userId] = userLogin;
  }

  @SubscribeMessage('GameDisconnect')
  async Disconnect(client, userId) {
    userId = parseInt(userId);
    client.leave(userId);
  }

  async setGameReady(player1_id: number, player2_id: number) { // ok

    let player1 = new Player(player1_id, this.UserIdToLogin[player1_id], true),
        player2 = new Player(player2_id, this.UserIdToLogin[player2_id], false);
    
    const release = await this.room_mutex.acquire();
    let gameRoom = new GameRoom(player1, player2);
    let room_number = this.gameRooms.length;
    this.gameRooms.push(gameRoom);
    release();

    let response = new Response('Room', 'Matched');
    gameRoom.sendToPlayers(this.server, ConstValues.RoomResponse,  JSON.stringify(response.getJSON()));
    gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player1.getJSON()));
    gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player2.getJSON()));
    gameRoom.sendToAll(this.server, ConstValues.Ball, JSON.stringify(gameRoom.ball.getJSON()));

    response.type = 'Game';
    response.content = {
      status: 'Ready',
      room: room_number.toString(),
      ballCarrier: player1_id
    };

    gameRoom.sendToAll(this.server, ConstValues.GameStatus, JSON.stringify(response.getJSON()));
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
          gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player2.getJSON()));
          if (player2.point >= ConstValues.WinningPoint) {
            ball.destroy();
            gameRoom.sendToAll(this.server, ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
            this.historyService.GameFinish(room_number, player2, player1);
          }
          else {
            player1.init();
            player2.init();
            ball.init(player1.id);
            player1.carryBall = true;
            gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player1.getJSON()));
            gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player2.getJSON()));
            gameRoom.sendToAll(this.server, ConstValues.Ball, JSON.stringify(ball.getJSON()));
            gameRoom.sendToAll(this.server, ConstValues.GameStatus, JSON.stringify((new Response('Game',  {status: 'Ready', room: room_number.toString(), ballCarrier: player1.id})).getJSON()));
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
          gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player1.getJSON()));
          if (player1.point >= ConstValues.WinningPoint) {
            ball.destroy();
            gameRoom.sendToAll(this.server, ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
            this.historyService.GameFinish(room_number, player1, player2);
          }
          else {
            player1.init();
            player2.init();
            ball.init(player2.id);
            player2.carryBall = true;
            gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player1.getJSON()));
            gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player2.getJSON()));
            gameRoom.sendToAll(this.server, ConstValues.Ball, JSON.stringify(ball.getJSON()));
            gameRoom.sendToAll(this.server, ConstValues.GameStatus, JSON.stringify((new Response('Game',  {status: 'Ready', room: room_number.toString(), ballCarrier: player2.id})).getJSON()));
          }
          clearInterval(interval);
          return ;
        }
      }
      gameRoom.sendToAll(this.server, ConstValues.Ball, JSON.stringify(ball.getJSON()));
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
        gameRoom.sendToAll(this.server, ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Start'}).getJSON())));
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
      }

      gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player1.getJSON()));
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
      }

      gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player2.getJSON()));
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
        gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player1.getJSON()));
        this.historyService.GameFinish(room_number, player2, player1);
      }
      else if (player2.id == id) {
        player2.point = -42;
        gameRoom.sendToAll(this.server, ConstValues.Player, JSON.stringify(player2.getJSON()));
        this.historyService.GameFinish(room_number, player1, player2); 
      }
      else return ;
      
      gameRoom.ball.destroy();
      gameRoom.sendToAll(this.server, ConstValues.Ball, JSON.stringify(gameRoom.ball.getJSON()));
      gameRoom.sendToAll(this.server, ConstValues.GameStatus, JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
    }
    else {
      console.log('Unknown special event');
    }
  }

  @SubscribeMessage('RoomRequest')
  async match(client, id) { // ok
    id = parseInt(id);
    let response = new Response('Room');

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

    let response = new Response('Watch');

    if (room_number != NaN && room_number < this.gameRooms.length) {
      let gameRoom = this.gameRooms[room_number];
      if (gameRoom.ball.isCarried == false) {
        response.content = { status: 'Accepted', id: gameRoom.player1.id, ballIsWith: 0};
      }
      else if (gameRoom.ball.ballCarrierId == gameRoom.player1.id) {
        response.content = { status: 'Accepted', id: gameRoom.player1.id, ballIsWith: 1};
      }
      else {
        response.content = { status: 'Accepted', id: gameRoom.player1.id, ballIsWith: 2};
      }
    
      
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
  }
  
}
