import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameService } from '../../services/game/game.service';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { FormBuilder } from '@angular/forms';
import { Rectangle } from './rectangle';

const canvasWidth: number = 600;
const canvasHeight: number = 450;
const paddleWidth: number = 12;
const paddleHeight: number = 30;
const ballWidth: number = 10;
const ballHeight: number = 10;
const ballColor: string = 'black';

// Subscription

var RoomSub: Subscription;
var GameSub: Subscription;
var PlayerSub: Subscription;
var BallSub: Subscription;
var WatchSub: Subscription;
var InfoSub: Subscription;

// Game Display

//     Sync with class (send to server)
var Logins: string[] = ['',''];
var room: number[] = [-1];
var paddles: Rectangle[] = []
var points: number[] = [0,0];
var hideItem: boolean[] = [false, true, true, false, true, true];

//      Used directly (send to server)

var ball: Rectangle;

//      User Info

var userLogin: string;
var userId: number;

var Interval;

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {


  public readonly canvasHeight: number = canvasHeight;
  public readonly canvasWidth: number = canvasWidth;

  public Logins: string[] = Logins;
  public hideItem: boolean[] = hideItem;
  public Points: number[] = points;
  public roomNumber: number[] = room;
  @ViewChild('myCanvas', {static: true})canvas!: ElementRef<HTMLCanvasElement>;
  
  public ctx!: CanvasRenderingContext2D;
  public watchForm = this.formBuilder.group({
    number: ''
  });

  constructor(
		private game: GameService,
		private authService: AuthService,
    private formBuilder: FormBuilder
	) {}

  ngOnInit(): void { // ok
    userLogin = this.authService.getLoggedInUser().login;
    userId = this.authService.getLoggedInUser().id;
    
    let tmp: any = this.canvas.nativeElement.getContext('2d');
    if (typeof tmp != 'undefined') {
      this.ctx = tmp;
    }

    if (paddles.length == 0) {
      paddles.push(new Rectangle(this.ctx, paddleWidth, paddleHeight, 0, canvasHeight / 2 - paddleHeight / 2));
      paddles.push(new Rectangle(this.ctx, paddleWidth, paddleHeight ,canvasWidth - paddleWidth, canvasHeight / 2 - paddleHeight / 2));
      ball = new Rectangle(this.ctx, ballWidth, ballHeight, -1, -1);
    }
    else {
      paddles[0].ctx = this.ctx;
      paddles[1].ctx = this.ctx;
      ball.ctx = this.ctx;
      // setTimeout(()=>{
      //   paddles[0].draw('red');
      //   paddles[1].draw('blue');
      //   ball.draw(ballColor);
      // },10);
      
    }

    Interval = setInterval(()=>{
      paddles[0].draw('Red');
      paddles[1].draw('Blue');
    },20);
    
    RoomSub = this.game.getRoomResponse().subscribe(this.DealWithRoomResponse);
    GameSub = this.game.getGameStatus().subscribe(this.DealWithGameStatus);
    PlayerSub = this.game.getPlayerInformation().subscribe(this.DealWithPlayerInformation);
    BallSub = this.game.getBallInformation().subscribe(this.DealWithBallInformation);
    WatchSub = this.game.getWatchResponse().subscribe(this.DealWithWatchResponse);
    InfoSub = this.game.getClientInfo().subscribe(this.DealWithClientInfo);

    this.game.sendGameConnect(userId, userLogin);
  }

  ngOnDestroy(): void { // ok
    this.game.sendGameDisconnect(userId);
    RoomSub.unsubscribe();
    GameSub.unsubscribe();
    PlayerSub.unsubscribe();
    BallSub.unsubscribe();
    WatchSub.unsubscribe();
    InfoSub.unsubscribe();
    clearInterval(Interval);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { // ok
    if (room[0] < 0 )
      return ;
    if (event.key == 'ArrowUp') {
      this.game.sendPlayerMove(room[0], userId, 'up');
    }
    if (event.key == 'ArrowDown') {
      this.game.sendPlayerMove(room[0], userId, 'down');
    }
    if (event.key == ' ') {
      this.game.sendPlayerMove(room[0], userId, 'space');
    }
  }

  DealWithClientInfo(msg: any) {
    try {
      if (typeof msg != 'string')
        throw('ServerError: ClientInfo is not a string');
      let data = JSON.parse(msg);

      if (data.leftLogin === undefined)
        throw('ServerError: leftLogin not found in ClientInfo');
      Logins[0] = data.leftLogin;
      if (data.rightLogin === undefined)
        throw('ServerError: rightLogin not found in ClientInfo');
      Logins[1] = data.rightLogin;

      if ( data.hideItem === undefined || hideItem.length != data.hideItem.length)
        throw('ServerError: hideItem error in ClientInfo');
      
      for (let i = 0 ; i < hideItem.length ; ++i)
        hideItem[i] = data.hideItem[i];

      if ( data.room === undefined )
        throw('ServerError: room error in ClientInfo');

      room[0] = data.room;

      if ( data.Heights === undefined || data.Heights.length != 2 ) {
        throw('ServerError: Heights error in ClientInfo');
      }
      paddles[0].clean();
      paddles[1].clean();
      paddles[0].yPos = data.Heights[0];
      paddles[1].yPos = data.Heights[1];
      paddles[0].draw('Red');
      paddles[1].draw('Blue');
    
    }
    catch(err: any) {
      alert(err);
    }
    finally {
    }
  }

  DealWithRoomResponse(msg: any) { // oK?
    let result = '';
    try {
      if (typeof msg != 'string')
        throw('ServerError: response is not a string');
      let data = JSON.parse(msg);
      if (!data.type || data.type != 'Room'){
        throw('ServerError: response type is not Room');
      }
      if (!data.content) {
        throw('ServerError: No Content');
      }
      if (typeof data.content != 'string') {
        throw('ServerError: Content is not a string');
      }
      switch(data.content) {
        case 'Duplicate':
          result = 'Waiting';
          throw('You were already in line, please be patient');
        case 'Waiting':
          // console.log('Waiting');
          result = 'Waiting';
          // add a popout window
          break ;
        case 'Matched':
          // console.log('Matched');
          result = 'Matched';
          break ;
        default:
          throw('ServerError: Unknown Content\n' + data.content);
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally{
    }
  }

  DealWithWatchResponse(msg: any) {
    try {
      if (typeof msg != 'string')
        throw('ServerError: response is not a string');
      let data = JSON.parse(msg);
      if (!data.type || data.type != 'Watch')
        throw('ServerError: response type is not Watch');
      if (!data.content)
        throw('ServerError: No Content');
      switch(data.content.status) {
        case 'Accepted':
          break ;
        case 'Refused':
          alert('Error: Room Number Not Found');
          break ;
        default:
          throw('ServerError: Unknown Content\n' + data.content);
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally{
    }
  }

  DealWithGameStatus(info: any) {
    let GameStatus = '';
    try {
      if (typeof info != 'string') {
        throw('ServerError: Game Status is not a string');
      }
      let data = JSON.parse(info);

      if (!data.type || data.type != 'Game') {
        throw('ServerError: Game Status type is not \'Game\'');
      }
      if (!data.content) {
        throw('ServerError: Game Status No Content');
      }
      switch(data.content.status ) {
        case 'Ready':
          GameStatus = 'Ready';
          // room[0] = data.content.room;
          // if (Logins[0] == data.content.ballCarrier)
          //   ballIsWith = 1;
          // else
          //   ballIsWith = 2;
          break ;
        case 'Start':
          GameStatus = 'Start';
          // ballIsWith = 0;
          break ;
        case 'Finish':
          GameStatus = 'Finish';
          break ;
        default:
          // room[0] = -1;
          GameStatus = '';
          throw('ServerError: Game Status Unknown Content\n' + data.content);
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally {
      if (GameStatus == 'Ready') {
        // paddles[0].draw('red');
        // paddles[1].draw('blue');
      }
      if (GameStatus == 'Start') {
      }
      if (GameStatus == 'Finish') {
        ball.clean();
        ball.xPos = canvasWidth;
        ball.yPos = canvasHeight;
      }
    }
  }

  DealWithPlayerInformation(info: any) {
    try {
      paddles.forEach((paddle: Rectangle)=>{
        paddle.clean();
      });
      if (typeof info != 'string') {
        throw('ServerError: Player is not a string');
      }
      let data = JSON.parse(info);
      if (!data.type || data.type != 'Player') {
        throw('ServerError: Player type is not \'Player\'');
      }
      if (!data.content) {
        throw('ServerError: Player No Content');
      }

      if (data.content.login == Logins[0]) {
        points[0] = data.content.point;
      }
      else {
        points[1] = data.content.point;
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally {
      // paddles[0].draw('red');
      // paddles[1].draw('blue');
    }
  }

  DealWithBallInformation(info: any) {
    try {
      ball.clean();
      if (typeof info != 'string') {
        throw('ServerError: Ball is not a string');
      }
      let data = JSON.parse(info);
      if (!data.type || data.type != 'Ball') {
        throw('ServerError: Ball type is not \'Ball\'');
      }
      if (!data.content) {
        throw('ServerError: Ball No Content');
      }
      ball.xPos = data.content.x;
      ball.yPos = data.content.y;
      
      // console.log(data.content.id);
      // console.log(Logins[0]);
      // console.log(info);
    }
    catch(err: any) {
      alert(err);
    }
    finally {
      ball.draw(ballColor);
      // console.log(room[0].toString() + 'C');
    }
  }


  RandomGame(): void {
    // console.log('A');
    // if (result == 'Waiting') {
    //   alert('You\'re already in line, please be patient.');
    //   return ;
    // }
    // if (result == 'Matched') {
    //   alert('You\'re already in game');
    //   return ;
    // }
    this.game.sendRoomRequest(userId);
  }

  // showCanvas() {

  // }

  // hideCanvas() {

  // }

  Surrender(): void {
    if (room[0] < 0)
      return ;
    this.game.sendSurrender(room[0], userId);
  }

  BackToMatch(): void {
    ball.clean2(0,0,canvasWidth,canvasHeight);
    this.game.sendLeaveGameRoom(userId);
    // room[0] = -1;
  }

  LeaveWatchingMode(): void {
    ball.clean2(0,0,canvasWidth,canvasHeight);
    this.game.sendLeaveWatching(room[0].toString(), userId);
    // room[0] = -1;
  }

  Cancel(): void {
    // result = '';
    this.game.sendCancelRequest(userId);
  }

  onSubmit() {
    // room[0] = parseInt(this.watchForm.value.number);
    this.game.sendWatchRequest(this.watchForm.value.number, userId);
    this.watchForm.reset();
  }
}
