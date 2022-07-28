import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Mutex } from 'async-mutex';
import { HistoryService } from './history/history.service';

const canvasWidth: number = 600;
const canvasHeight: number = 450;
const paddleWidth: number = 12;
const paddleHeight: number = 30;
const ballWidth: number = 10;
const ballHeight: number = 10;
const animationFrameRate = 30;
const WinningPoint: number = 3;
// var GameIsMoving: Map<number,boolean> = new Map<number,boolean>(); // GameIsMoving[room_number] = is_in_game

class Response {
  constructor (public type: string, public content?: any) {}

  getJSON() {
    if (this.content) {
      return {type: this.type, content: this.content};
    }
    return {type: this.type};
  }
}

class Player {
  public height: number;
  public point: number = 0;
  constructor (public id: string, public socket: any, public carryBall: boolean) {
    this.height = canvasHeight / 2 - paddleHeight / 2;
    // this.point = 0;
  }

  init() {
    this.height = canvasHeight / 2 - paddleHeight / 2;
  }

  getJSON() {
    return {
      type: "Player",
      content: {
        id: this.id,
        height: this.height,
        point: this.point
      }
    };
  }
}

class Ball {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public isCarried: boolean;
  public ballCarrierId: string;
  constructor (public readonly player1Id: string) {
    this.init(player1Id);
  }

  init(ballCarrierId: string) { // 1 or 2
    this.ballCarrierId = ballCarrierId;
    this.isCarried = true;
    if (this.ballCarrierId == this.player1Id) {
      this.x = paddleWidth;
      this.y = canvasHeight / 2 - ballHeight / 2;
      this.vx = 5;
      this.vy = 5;
    }
    else {
      this.x = canvasWidth - ballWidth - paddleWidth;
      this.y = canvasHeight / 2 - ballHeight / 2;
      this.vx = -5;
      this.vy = -5;
    }
  }

  destroy() {
    this.isCarried = false;
    this.x = canvasWidth;
    this.y = canvasHeight;
  }

  getJSON() {
    return {
      type: "Ball",
      content: {
        id: this.player1Id,
        x: this.x,
        y: this.y
      }
    };
  }
}

class GameRoom {
  static readonly MoveDistance: number = 10;
  public ball: Ball;
  constructor (public player1: Player, public player2: Player) {
    this.ball = new Ball(player1.id); // todo?
  }
}

@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] }})
export class GameGateway implements OnGatewayDisconnect {
  @WebSocketServer() server;

  waiting_clients = []
  mutex: Mutex;
  room_mutex: Mutex;
  SocketOfClient: Map<string,any>;
  rooms: number;
  gameRooms: Map<number, GameRoom>;

  constructor(public historyService: HistoryService) {
    this.rooms = 0;
    this.room_mutex = new Mutex();
    this.mutex = new Mutex();
    this.SocketOfClient = new Map<string, any>();
    this.gameRooms = new Map<number, GameRoom>();
  }

  handleDisconnect(client: any) {
    // todo
  }

  async setGameReady(player1_id, player2_id) {
    let player1 = new Player(player1_id, this.SocketOfClient[player1_id], true),
        player2 = new Player(player2_id, this.SocketOfClient[player2_id], false);
    const release = await this.room_mutex.acquire();
    let room_number = this.rooms++;
    // release();
    player1.socket.join(room_number);
    player2.socket.join(room_number);
    let response = new Response('Room', 'Matched');
    this.historyService.GameStart(player1_id, player2_id);
    this.server.to(room_number).emit('RoomResponse',  JSON.stringify(response.getJSON()));
    // let roomHash = Math.random().toString(36).substring(7);
    // this.server.to(room_number).emit('RoomInfo', JSON.stringify((new Response('RoomHash',)).getJSON()));
    this.server.to(room_number).emit('Player', JSON.stringify(player1.getJSON()));
    this.server.to(room_number).emit('Player', JSON.stringify(player2.getJSON()));
        response.type = 'Game';
    response.content = {
      status: 'Ready',
      room: room_number.toString(),
      ballCarrier: player1_id
    };

    this.gameRooms[room_number] = new GameRoom(player1, player2);
    this.server.to(room_number).emit('Ball', JSON.stringify(this.gameRooms[room_number].ball.getJSON()));
    this.server.to(room_number).emit('GameStatus',  JSON.stringify(response.getJSON()));
    // todo, when game finish send Finish, deal with players, sockets, and games ?
  }

  async moveBall(room_number: number) {
    // let room: GameRoom = this.gameRooms[room_number];
    // let ball: Ball = room.ball;
    let balls: Ball[] = [this.gameRooms[room_number].ball];
    let players: Player[] = [this.gameRooms[room_number].player1, this.gameRooms[room_number].player2];
    // let player1: Player = room.player1, player2: Player = room.player2;
    const minX = paddleWidth;
    const maxX = canvasWidth - ballWidth - paddleWidth;
    const minY = 0;
    const maxY = canvasHeight - ballHeight;
    const interval = setInterval(()=>{
      // if (GameIsMoving[room_number] == false) {
      //   clearInterval(interval);
      //   return ;
      // }
      if (players[0].point < 0 || players[1].point < 0) {
        clearInterval(interval);
        return ;
      }
      balls[0].x += balls[0].vx;
      balls[0].y += balls[0].vy;
      if (balls[0].y < minY) {
        balls[0].y = 2 * minY - balls[0].y;
        balls[0].vy *= -1;
      }
      else if (balls[0].y > maxY) {
        balls[0].y = 2 * maxY - balls[0].y;
        balls[0].vy *= -1;
      }
      if (balls[0].x < minX) {
        if ((balls[0].y + ballHeight >= players[0].height) && (balls[0].y <= players[0].height + paddleHeight) ) {
          balls[0].x = 2 * minX - balls[0].x;
          balls[0].vx *= -1;
        } 
        else {
          ++(players[1].point);
          this.server.to(room_number).emit('Player', JSON.stringify(players[1].getJSON()));
          if (players[1].point >= WinningPoint) {
            // this.gameRooms.delete(room_number);
            balls[0].destroy();
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
            // this.historyService.GameUpdate(room_number, players[0].id, players[1].id, players[0].point, players[1].point, 'Finish');
            this.historyService.GameFinish(players[1].id, players[0].id);
          }
          else {
            players[0].init();
            players[1].init();
            balls[0].init(players[0].id);
            players[0].carryBall = true;
            this.server.to(room_number).emit('Player', JSON.stringify(players[0].getJSON()));
            this.server.to(room_number).emit('Player', JSON.stringify(players[1].getJSON()));
            this.server.to(room_number).emit('Ball', JSON.stringify(balls[0].getJSON()));
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game',  {status: 'Ready', room: room_number.toString(), ballCarrier: players[0].id})).getJSON()));
            // this.historyService.GameUpdate(room_number, players[0].id, players[1].id, players[0].point, players[1].point, 'In Game');
          }
          // console.log(interval);
          // GameIsMoving[room_number] = false;
          clearInterval(interval);
          return ;
        }
      }
      else if (balls[0].x > maxX) {
        if ((balls[0].y + ballHeight >= players[1].height) && (balls[0].y <= players[1].height + paddleHeight) ) {
          balls[0].x = 2 * maxX - balls[0].x;
          balls[0].vx *= -1;
        }
        else {
          ++(players[0].point);
          // console.log(this.gameRooms[room_number].player1.point);
          this.server.to(room_number).emit('Player', JSON.stringify(players[0].getJSON()));
          if (players[0].point >= WinningPoint) {
            // this.gameRooms.delete(room_number);
            balls[0].destroy();
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
            this.historyService.GameFinish(players[0].id, players[1].id);
              // this.historyService.GameUpdate(room_number, players[0].id, players[1].id, players[0].point, players[1].point, 'In Game');
          }
          else {
            players[0].init();
            players[1].init();
            balls[0].init(players[1].id);
            players[1].carryBall = true;
            // console.log(players[0].height);
            // console.log(this.gameRooms[room_number].player1.height);
            this.server.to(room_number).emit('Player', JSON.stringify(players[0].getJSON()));
            this.server.to(room_number).emit('Player', JSON.stringify(players[1].getJSON()));
            this.server.to(room_number).emit('Ball', JSON.stringify(balls[0].getJSON()));
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game',  {status: 'Ready', room: room_number.toString(), ballCarrier: players[1].id})).getJSON()));
            // this.historyService.GameUpdate(room_number, players[0].id, players[1].id, players[0].point, players[1].point, 'In Game');

          }
          // GameIsMoving[room_number] = false;
          clearInterval(interval);
          return ;
        }
      }
      this.server.to(room_number).emit('Ball', JSON.stringify(balls[0].getJSON()));
    }, animationFrameRate);
  }

  @SubscribeMessage('PlayerMove')
  async movePlayer(client, [room_number, id, direction]) {
    // if (this.gameRooms[room_number].player2.carryBall)
      // console.log(this.gameRooms[room_number].player1.point);
      // console.log(this.gameRooms[room_number].player1.height);
    if (direction == 'space') {
      if ( this.gameRooms[room_number].ball.isCarried && id == this.gameRooms[room_number].ball.ballCarrierId ) {
        this.server.to(parseInt(room_number)).emit('GameStatus', JSON.stringify((new Response('Game', {status: 'Start'}).getJSON())));
        this.gameRooms[room_number].player1.carryBall = false;
        this.gameRooms[room_number].player2.carryBall = false;
        this.gameRooms[room_number].ball.isCarried = false;
        // GameIsMoving[room_number] = true;
        this.moveBall(parseInt(room_number));
      }
      return ;
    }
    if (id == this.gameRooms[room_number].player1.id) {
      switch (direction) {
        case 'up':
          this.gameRooms[room_number].player1.height -= GameRoom.MoveDistance;
          if (this.gameRooms[room_number].player1.height < 0)
            this.gameRooms[room_number].player1.height = 0;
          break ;
        case 'down':
          this.gameRooms[room_number].player1.height += GameRoom.MoveDistance;
          if (this.gameRooms[room_number].player1.height > canvasHeight - paddleHeight)
            this.gameRooms[room_number].player1.height = canvasHeight - paddleHeight;
          break ;
        default:
          console.log('ClientError: Invalid PlayerMove direction ' + direction);
      }
      if (this.gameRooms[room_number].player1.carryBall) {
        this.gameRooms[room_number].ball.y = this.gameRooms[room_number].player1.height + paddleHeight / 2 - ballHeight / 2;
        // this.server.to(parseInt(room_number)).emit('Ball', JSON.stringify(this.gameRooms[room_number].ball.getJSON()));
      }
      // console.log(this.gameRooms[room_number].player1.point);
      this.server.to(parseInt(room_number)).emit('Player', JSON.stringify(this.gameRooms[room_number].player1.getJSON()));
    }
    else if (id == this.gameRooms[room_number].player2.id) {
      switch (direction) {
        case 'up':
          this.gameRooms[room_number].player2.height -= GameRoom.MoveDistance;
          if (this.gameRooms[room_number].player2.height < 0)
            this.gameRooms[room_number].player2.height = 0;
          break ;
        case 'down':
          this.gameRooms[room_number].player2.height += GameRoom.MoveDistance;
          if (this.gameRooms[room_number].player2.height > canvasHeight - paddleHeight)
            this.gameRooms[room_number].player2.height = canvasHeight - paddleHeight;
          break ;
        default:
          console.log('ClientError: Invalid PlayerMove direction ' + direction);
      }
      if (this.gameRooms[room_number].player2.carryBall) {
        this.gameRooms[room_number].ball.y = this.gameRooms[room_number].player2.height + paddleHeight / 2 - ballHeight / 2;
        // this.server.to(parseInt(room_number)).emit('Ball', JSON.stringify(this.gameRooms[room_number].ball.getJSON()));
      }
      this.server.to(parseInt(room_number)).emit('Player', JSON.stringify(this.gameRooms[room_number].player2.getJSON()));
    }
  }

  @SubscribeMessage('Special')
  async speicalEvent(client, [room_number, id, information]) {
    // console.log(room_number);
    if (information == 'Surrender') {
      // clearInterval(interval);
      // GameIsMoving[room_number] = false;
      let player1: Player = this.gameRooms[room_number].player1, player2: Player = this.gameRooms[room_number].player2;
      if (player1.id == id) {
        player1.point = -42;
        this.server.to(parseInt(room_number)).emit('Player', JSON.stringify(player1.getJSON()));
        // this.historyService.GameUpdate(room_number, player1.id, player2.id, player1.point, player2.point, 'Finish');
        this.historyService.GameFinish(player2.id, player1.id);
      }
      else if (player2.id == id) {
        player2.point = -42;
        this.server.to(parseInt(room_number)).emit('Player', JSON.stringify(player2.getJSON()));
        this.historyService.GameFinish(player1.id, player2.id);
        // this.historyService.GameUpdate(room_number, player1.id, player2.id, player1.point, player2.point, 'Finish');
      }
      else return ;
      // this.gameRooms.delete(room_number);
      this.gameRooms[room_number].ball.destroy();
      this.server.to(parseInt(room_number)).emit('Ball', JSON.stringify(this.gameRooms[room_number].ball.getJSON()));
      this.server.to(parseInt(room_number)).emit('GameStatus', JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
    }
    else {
      console.log('Unknown special event');
    }
  }

  @SubscribeMessage('RoomRequest')
  async match(client, id) {
    let response = new Response('Room');
    this.SocketOfClient[id] = client;
    // if (to == '') { // random request
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

    this.server.to(client.id).emit('RoomResponse', JSON.stringify(response.getJSON()));
  }

  @SubscribeMessage('WatchRequest')
  async watch(client, [room_number_str, id]) {
    let response = new Response('Watch');
    this.SocketOfClient[id] = client;
    // if (to == '') { // random request
    let room_number: number = parseInt(room_number_str);
    if (this.gameRooms[room_number] == undefined) {
      response.content = { status: 'Refused' };
    }
    else {
      // console.log(this.gameRooms[room_number]);
      if (this.gameRooms[room_number].ball.isCarried == false) {
        response.content = { status: 'Accepted', id: this.gameRooms[room_number].player1.id, ballIsWith: 0};
      }
      else if (this.gameRooms[room_number].ball.ballCarrierId == this.gameRooms[room_number].player1.id) {
        response.content = { status: 'Accepted', id: this.gameRooms[room_number].player1.id, ballIsWith: 1};
      }
      else {
        response.content = { status: 'Accepted', id: this.gameRooms[room_number].player1.id, ballIsWith: 2};
      }
    
      
      this.server.to(client.id).emit('Player', JSON.stringify(this.gameRooms[room_number].player1.getJSON()));
      this.server.to(client.id).emit('Player', JSON.stringify(this.gameRooms[room_number].player2.getJSON()));
      this.server.to(client.id).emit('Ball', JSON.stringify(this.gameRooms[room_number].ball.getJSON()));  
      client.join(room_number);
    }
    this.server.to(client.id).emit('WatchResponse', JSON.stringify(response.getJSON()));

    // const release = await this.mutex.acquire();
    // if (this.waiting_clients.indexOf(id) != -1) {
    //   response.content = 'Duplicate';
    // }
    // else {
    //   let len = this.waiting_clients.length;
    //   if (len > 0) {
    //     let opponent = this.waiting_clients.pop();
    //     release();
    //     this.setGameReady( opponent, id );
    //     return ;
    //   }
    //   else {
    //     this.waiting_clients.push(id);
    //     response.content = 'Waiting';
    //   }
    // }
    // release();

    // this.server.to(client.id).emit('RoomResponse', JSON.stringify(response.getJSON()));
  }

  @SubscribeMessage('LeaveWatching')
  async leaveWatching(client, [room_number_str, login]) {
    let room_number: number = parseInt(room_number_str);
    this.SocketOfClient[login].leave(room_number);
  }

  @SubscribeMessage('CancelRoom')
  async cancelRoomRequest(client, id) {
    const release = await this.mutex.acquire();
    let index = this.waiting_clients.indexOf(id);
    if (index != -1) {
      this.waiting_clients.splice(index, 1);
    }
    release();
  }
  
}


/*
import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;
  users: number = 0;

  async handleConnection() {
    this.users++;
    this.server.emit('users', this.users);
  }

  async handleDisconnect() {
    this.users--;
    this.server.emit('users', this.users);
  }

  @SubscribeMessage('chat')
  async onChat(client, message) {

    client.broadcast.emit('chat', message);
  }

}

*/
