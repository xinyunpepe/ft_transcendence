import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Mutex } from 'async-mutex';

const canvasWidth: number = 600;
const canvasHeight: number = 450;
const paddleWidth: number = 12;
const paddleHeight: number = 30;
const ballWidth: number = 10;
const ballHeight: number = 10;
const animationFrameRate = 30;
const WinningPoint: number = 3;

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
  public point: number;
  constructor (public id: string, public socket: any, public carryBall: boolean) {
    this.height = canvasHeight / 2 - paddleHeight / 2;
    this.point = 0;
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

  // getOppositeJSON() {
  //   return {
  //     type: "Ball",
  //     content: {
  //       x:  canvasWidth - paddleWidth - ballWidth - this.x,
  //       y: this.y,
  //       vx: -1 * this.vx,
  //       vy: this.vy
  //     }
  //   };
  // }
}

class GameRoom {
  static readonly MoveDistance: number = 10;
  public ball: Ball;
  constructor (public player1: Player, public player2: Player) {
    this.ball = new Ball(player1.id); // todo?
  }
}

// todo: connect and disconnect ? (manage socket and ids)

@WebSocketGateway({cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] }})
export class GameGateway {
  @WebSocketServer() server;

  waiting_clients = []
//   mutex: Mutex;
//   room_mutex: Mutex;
  SocketOfClient: Map<string,any>;
  rooms: number;
  gameRooms: Map<number, GameRoom>;

  constructor() {
    this.rooms = 0;
    // this.room_mutex = new Mutex();
    // this.mutex = new Mutex();
    this.SocketOfClient = new Map<string, any>();
    this.gameRooms = new Map<number, GameRoom>();
  }

  async setGameReady(player1_id, player2_id) {
    let player1 = new Player(player1_id, this.SocketOfClient[player1_id], true),
        player2 = new Player(player2_id, this.SocketOfClient[player2_id], false);
    this.SocketOfClient.delete(player1_id);
    this.SocketOfClient.delete(player2_id);
    // const release = await this.room_mutex.acquire();
    let room_number = this.rooms++;
    // release();
    player1.socket.join(room_number);
    player2.socket.join(room_number);
    let response = new Response('Room', 'Matched');
    this.server.to(room_number).emit('RoomResponse',  JSON.stringify(response.getJSON()));
    this.server.to(room_number).emit('Player', JSON.stringify(player1.getJSON()));
    this.server.to(room_number).emit('Player', JSON.stringify(player2.getJSON()));
        response.type = 'Game';
    response.content = {
      status: 'Ready',
      room: room_number.toString()
    };

    this.gameRooms[room_number] = new GameRoom(player1, player2);
    this.server.to(room_number).emit('Ball', JSON.stringify(this.gameRooms[room_number].ball.getJSON()));
    this.server.to(room_number).emit('GameStatus',  JSON.stringify(response.getJSON()));
    // todo, when game finish send Finish, deal with players, sockets, and games ?
  }

  async moveBall(room_number: number) {
    let room: GameRoom = this.gameRooms[room_number];
    let ball: Ball = room.ball;
    let player1: Player = room.player1, player2: Player = room.player2;
    const minX = paddleWidth;
    const maxX = canvasWidth - ballWidth - paddleWidth;
    const minY = 0;
    const maxY = canvasHeight - ballHeight;
    const i = setInterval(()=>{
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
        if ((ball.y + ballHeight >= player1.height) && (ball.y <= player1.height + paddleHeight) ) {
          ball.x = 2 * minX - ball.x;
          ball.vx *= -1;
        }
        else {
          ++(player2.point);
          this.server.to(room_number).emit('Player', JSON.stringify(player2.getJSON()));
          if (player2.point >= WinningPoint) {
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
          }
          else {
            player1.init();
            player2.init();
            ball.init(player1.id);
            player1.carryBall = true;
            this.server.to(room_number).emit('Player', JSON.stringify(player1.getJSON()));
            this.server.to(room_number).emit('Player', JSON.stringify(player2.getJSON()));
            this.server.to(room_number).emit('Ball', JSON.stringify(ball.getJSON()));
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game',  {status: 'Ready', room: room_number.toString()})).getJSON()));
          }
          clearInterval(i);
          return ;
        }
      }
      else if (ball.x > maxX) {
        if ((ball.y + ballHeight >= player2.height) && (ball.y <= player2.height + paddleHeight) ) {
          ball.x = 2 * maxX - ball.x;
          ball.vx *= -1;
        }
        else {
          ++(player1.point);
          this.server.to(room_number).emit('Player', JSON.stringify(player1.getJSON()));
          if (player1.point >= WinningPoint) {
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game', {status: 'Finish'})).getJSON()));
          }
          else {
            player1.init();
            player2.init();
            ball.init(player2.id);
            player2.carryBall = true;
            this.server.to(room_number).emit('Player', JSON.stringify(player1.getJSON()));
            this.server.to(room_number).emit('Player', JSON.stringify(player2.getJSON()));
            this.server.to(room_number).emit('Ball', JSON.stringify(ball.getJSON()));
            this.server.to(room_number).emit('GameStatus', JSON.stringify((new Response('Game',  {status: 'Ready', room: room_number.toString()})).getJSON()));
          }
          clearInterval(i);
          return ;
        }
      }
      this.server.to(room_number).emit('Ball', JSON.stringify(ball.getJSON()));
    }, animationFrameRate);
  }

  @SubscribeMessage('PlayerMove')
  async movePlayer(client, [room_number, id, direction]) {
    let room: GameRoom = this.gameRooms[room_number];
    if (direction == 'space') {
      if ( room.ball.isCarried && id == room.ball.ballCarrierId ) {
        room.player1.carryBall = false;
        room.player2.carryBall = false;
        room.ball.isCarried = false;
        this.moveBall(parseInt(room_number));
      }
      return ;
    }
    if (id == room.player1.id) {
      switch (direction) {
        case 'up':
          room.player1.height -= GameRoom.MoveDistance;
          if (room.player1.height < 0)
            room.player1.height = 0;
          break ;
        case 'down':
          room.player1.height += GameRoom.MoveDistance;
          if (room.player1.height > canvasHeight - paddleHeight)
            room.player1.height = canvasHeight - paddleHeight;
          break ;
        default:
          console.log('ClientError: Invalid PlayerMove direction ' + direction);
      }
      if (room.player1.carryBall) {
        room.ball.y = room.player1.height + paddleHeight / 2 - ballHeight / 2;
        this.server.to(parseInt(room_number)).emit('Ball', JSON.stringify(room.ball.getJSON()));
      }
      this.server.to(parseInt(room_number)).emit('Player', JSON.stringify(room.player1.getJSON()));
    }
    else if (id == room.player2.id) {
      switch (direction) {
        case 'up':
          room.player2.height -= GameRoom.MoveDistance;
          if (room.player2.height < 0)
            room.player2.height = 0;
          break ;
        case 'down':
          room.player2.height += GameRoom.MoveDistance;
          if (room.player2.height > canvasHeight - paddleHeight)
            room.player2.height = canvasHeight - paddleHeight;
          break ;
        default:
          console.log('ClientError: Invalid PlayerMove direction ' + direction);
      }
      if (room.player2.carryBall) {
        room.ball.y = room.player2.height + paddleHeight / 2 - ballHeight / 2;
        this.server.to(parseInt(room_number)).emit('Ball', JSON.stringify(room.ball.getJSON()));
      }
      this.server.to(parseInt(room_number)).emit('Player', JSON.stringify(room.player2.getJSON()));
    }
    else {
      console.log('ClientError: Invalid PlayerMove room_number or id');
    }
  }

  @SubscribeMessage('RoomRequest')
  async match(client, [from, to]) {
    let response = new Response('Room');
    this.SocketOfClient[from] = client;
    if (to == '') { // random request
    //   const release = await this.mutex.acquire();
      if (this.waiting_clients.indexOf(from) != -1) {
        response.content = 'Duplicate';
      }
      else {
        let len = this.waiting_clients.length;
        if (len > 0) {
          let opponent = this.waiting_clients.pop();
        //   release();
          this.setGameReady( opponent, from );
          return ;
        }
        else {
          this.waiting_clients.push(from);
          response.content = 'Waiting';
        }
      }
    //   release();
    }
    else { // to certain person
      //todo
    }

    this.server.to(client.id).emit('RoomResponse', JSON.stringify(response.getJSON()));
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
