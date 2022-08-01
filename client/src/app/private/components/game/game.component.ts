import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameService } from '../../services/game/game.service';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { FormBuilder } from '@angular/forms';
import { Rectangle } from './rectangle';


var result: string = '';
var RoomSub: Subscription;
var GameSub: Subscription;
var PlayerSub: Subscription;
var BallSub: Subscription;
var WatchSub: Subscription;

var userLogin: string;
var leftLogin: string[] = [''];
var room: number[] = [-1];
var paddles: Rectangle[] = [];
var ball: Rectangle;
var ballIsWith: number = 0;
const canvasWidth: number = 600;
const canvasHeight: number = 450;
const paddleWidth: number = 12;
const paddleHeight: number = 30;
const ballWidth: number = 10;
const ballHeight: number = 10;
const ballColor: string = 'black';

var points: number[] = [0,0];
var hideItem: boolean[] = [false, true, true, false, true, true];
var opponentLogin: [string] = [''];
var leftHeight: number = canvasHeight / 2 - paddleHeight / 2;
var rightHeight: number = canvasHeight / 2 - paddleHeight / 2;
var GameStatus: string = '';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

  public userLogin: string = '';
  public leftLogin: string[] = leftLogin;
  public opponentLogin: string[] = opponentLogin;
  public gamePlayed : number = 0;
  public hideItem: boolean[] = hideItem;
  public Points: number[] = points;
  @ViewChild('myCanvas', {static: true})canvas!: ElementRef<HTMLCanvasElement>;
  public canvasHeight: number = canvasHeight;
  public canvasWidth: number = canvasWidth;
  public ctx!: CanvasRenderingContext2D;
  public roomNumber: number[] = room;
  public watchForm = this.formBuilder.group({
    number: ''
  });

  constructor(
		private game: GameService,
		private authService: AuthService,
    private formBuilder: FormBuilder
	) {
    
  }

  ngOnInit(): void {
    RoomSub = this.game.getRoomResponse().subscribe(this.DealWithRoomResponse);
    GameSub = this.game.getGameStatus().subscribe(this.DealWithGameStatus);
    PlayerSub = this.game.getPlayerInformation().subscribe(this.DealWithPlayerInformation);
    BallSub = this.game.getBallInformation().subscribe(this.DealWithBallInformation);
    WatchSub = this.game.getWatchResponse().subscribe(this.DealWithWatchResponse);

    userLogin = this.authService.getLoggedInUser().login;
    this.userLogin = userLogin;
    let tmp: any = this.canvas.nativeElement.getContext('2d');
    if (typeof tmp != 'undefined') {
      this.ctx = tmp;
    }
    if (paddles.length == 0) {
      paddles.push(new Rectangle(this.ctx, paddleWidth, paddleHeight, 0, leftHeight));
      paddles.push(new Rectangle(this.ctx, paddleWidth, paddleHeight ,canvasWidth - paddleWidth, rightHeight));
      ball = new Rectangle(this.ctx, ballWidth, ballHeight, -1, -1);
    }
    else {
      paddles[0].ctx = this.ctx;
      paddles[1].ctx = this.ctx;
      ball.ctx = this.ctx;
      setTimeout(()=>{
        paddles[0].draw('red');
        paddles[1].draw('blue');
        ball.draw(ballColor);
      },10);
      
    }
  }

  ngOnDestroy(): void {
    RoomSub.unsubscribe();
    GameSub.unsubscribe();
    PlayerSub.unsubscribe();
    BallSub.unsubscribe();
    WatchSub.unsubscribe();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (room[0] < 0 || userLogin == undefined || userLogin == '' )
      return ;
    if (event.key == 'ArrowUp') {
      this.game.sendPlayerMove(room[0], userLogin, 'up');
    }
    if (event.key == 'ArrowDown') {
      this.game.sendPlayerMove(room[0], userLogin, 'down');
    }
    if (event.key == ' ') {
      this.game.sendPlayerMove(room[0], userLogin, 'space');
    }
  }

  DealWithRoomResponse(msg: any) {
    try {
      result = '';
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
      if (result == 'Matched') {
        hideItem[0] = true;
        hideItem[4] = false;
      }
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
          hideItem[0] = true;
          hideItem[3] = true; //
          hideItem[5] = false;
          leftLogin[0] = data.content.id;
          ballIsWith = data.content.ballIsWith;
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
    try {
      GameStatus = '';
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
          room[0] = data.content.room;
          if (leftLogin[0] == data.content.ballCarrier)
            ballIsWith = 1;
          else
            ballIsWith = 2;
          break ;
        case 'Start':
          GameStatus = 'Start';
          // ballIsWith = 0;
          break ;
        case 'Finish':
          result = '';
          GameStatus = 'Finish';
          break ;
        default:
          result = '';
          room[0] = -1;
          GameStatus = '';
          throw('ServerError: Game Status Unknown Content\n' + data.content);
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally {
      if (GameStatus == 'Ready') {
        // other things dissapear
        // todo
        paddles[0].draw('red');
        paddles[1].draw('blue');
      }
      if (GameStatus == 'Start') {
        // console.log('Start');
        ballIsWith = 0;
        // todo: move ball
      }
      if (GameStatus == 'Finish') {
        ball.clean();
        ball.xPos = canvasWidth;
        ball.yPos = canvasHeight;
        hideItem[1] = false;
        hideItem[3] = false;
        // hideItem[5] = true;
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
      // if (this.userLogin == undefined || this.userLogin == '')
      //   this.userLogin = userLogin;
      if (data.content.id == leftLogin[0]) {
        leftHeight = data.content.height;
        points[0] = data.content.point;

        if (rightHeight == undefined)
          rightHeight = canvasHeight / 2 - paddleHeight / 2;
        // if (!this.Points[1])
        //   this.Points[1] = 0;
      }
      else {
        opponentLogin[0] = data.content.id;
        rightHeight = data.content.height;
        points[1] = data.content.point;
        if (leftHeight == undefined)
          leftHeight = canvasHeight / 2 - paddleHeight / 2;
        // if (!this.Points[0])
        //   this.Points[0] = 0;
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally {
      // console.log(room[0].toString() + 'B');
      paddles[0].yPos = leftHeight;
      paddles[1].yPos = rightHeight;
      // console.log(toRealHeight(canvasHeight, leftHeight).toString() + ' ' + rightHeight.toString());
      // console.log(paddles[0].xPos.toString() + " " + paddles[0].yPos.toString());
      paddles[0].draw('red');
      paddles[1].draw('blue');
      // console.log('My Position(left): ' + leftHeight.toString() + ' Opponent Position(right): ' + rightHeight.toString() + '\
      //  \nMy Point(left)   : ' + this.Points[0].toString() +    ' Opponent Point(right)   : ' + this.Points[1].toString()) ;
      if (ballIsWith == 1) {
        ball.clean();
        ball.yPos = paddles[0].yPos + paddleHeight / 2 - ballHeight / 2;
        ball.xPos = paddleWidth;
        ball.draw(ballColor);
        // console.log(ball.xPos);
        // console.log(paddles[0].yPos);
        // console.log(ball.yPos);
        // console.log(room[0].toString() + 'A');
      }
      if (ballIsWith == 2) {
        ball.clean();
        ball.xPos = canvasWidth - ballWidth - paddleWidth;
        ball.yPos = paddles[1].yPos + paddleHeight / 2 - ballHeight / 2;
        ball.draw(ballColor);
        // c
      }
    }
  }

  DealWithBallInformation(info: any) {
    if (ballIsWith != 0)
      return ;
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
      // if (this.userLogin == undefined || this.userLogin == '')
      //   this.userLogin = userLogin;
      if (data.content.id == leftLogin[0]) { // player1
        ball.xPos = data.content.x;
        ball.yPos = data.content.y;
      }
      else { // player2
        ball.xPos = canvasWidth - ballWidth - data.content.x;
        ball.yPos = data.content.y;
      }
      // console.log(data.content.id);
      // console.log(leftLogin[0]);
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
    if (result == 'Waiting') {
      alert('You\'re already in line, please be patient.');
      return ;
    }
    if (result == 'Matched') {
      alert('You\'re already in game');
      return ;
    }
    leftLogin[0] = userLogin;
    // if (result != 'Waiting')
    this.game.sendRoomRequest(userLogin);

    hideItem[2] = false;
  }

  // showCanvas() {

  // }

  // hideCanvas() {

  // }

  Surrender(): void {
    if (room[0] < 0 || userLogin == undefined || userLogin == '' )
      return ;
    this.game.sendSurrender(room[0], userLogin);
  }

  BackToMatch(): void {
    ball.clean2(0,0,canvasWidth,canvasHeight);
    hideItem[0] = false;
    hideItem[4] = true;
    hideItem[5] = true;
    hideItem[1] = true;
    hideItem[2] = true;
    leftLogin[0] = userLogin;
    room[0] = -1;
  }

  LeaveWatchingMode(): void {
    ball.clean2(0,0,canvasWidth,canvasHeight);
    hideItem[3] = false;
    hideItem[0] = false;
    hideItem[4] = true;
    hideItem[5] = true;
    hideItem[1] = true;
    hideItem[2] = true;
    leftLogin[0] = userLogin;
    this.game.sendLeaveWatching(room[0].toString(), userLogin);
    room[0] = -1;
  }

  Cancel(): void {
    hideItem[2] = true;
    result = '';
    this.game.sendCancelRequest(userLogin);
  }

  onSubmit() {
    room[0] = parseInt(this.watchForm.value.number);
    this.game.sendWatchRequest(this.watchForm.value.number, userLogin);
    this.watchForm.reset();
  }
}
