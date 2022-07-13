import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameService } from '../../services/game/game.service';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth/auth.service';

export class Rectangle {
	constructor(private ctx: CanvasRenderingContext2D, private width: number, private height: number, public xPos: number, public yPos: number) {}

	draw(color: string) {
		// if (this.xPos < 0 || this.yPos < 0)
		// 	return ;
		// console.log('draw: ' + this.yPos.toString() + ' ' + this.height.toString());
    	this.ctx.fillStyle = color;
		// console.log(this.xPos.toString() + ' ' + this.yPos.toString() + ' ' + this.width.toString() + ' ' + this.height.toString());
    	this.ctx.fillRect(this.xPos, this.yPos, this.width, this.height);
  	}

	clean() {
		// if (this.xPos < 0 || this.yPos < 0)
		// 	return ;
		// console.log('clean: ' + this.yPos.toString() + ' ' + this.height.toString());
		this.ctx.clearRect(this.xPos, this.yPos, this.width, this.height);
	}

	clean2(x:number, y:number, w:number, h:number) {
		this.ctx.clearRect(x, y, w, h);
	}

}

var result: string = '';
var sub: Subscription;
var GameSub: Subscription;
var PlayerSub: Subscription;
var BallSub: Subscription;
// var userSub: Subscription;
var userLogin: string;
var room: number = -1;
var paddles: Rectangle[] = [];
var ball: Rectangle;
const canvasWidth: number = 600;
const canvasHeight: number = 450;
const paddleWidth: number = 12;
const paddleHeight: number = 30;
const ballWidth: number = 10;
const ballHeight: number = 10;
const ballColor: string = 'black';
var points: number[] = [0,0];
var hideItem: boolean[] = [false, true];
var hideScore: boolean[] = [true];
var opponentLogin: [string] = [''];

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  public userLogin: string = '';
  public opponentLogin: string[] = opponentLogin;
  public gamePlayed : number = 0;
  private GameStatus: string = '';
  public hideItem: boolean[] = hideItem;
  public hideScore: boolean[] = hideScore;
  private leftHeight: number = canvasHeight / 2 - paddleHeight / 2;
  private rightHeight: number = canvasHeight / 2 - paddleHeight / 2;
  public Points: number[] = points;
  @ViewChild('myCanvas', {static: true})canvas!: ElementRef<HTMLCanvasElement>;
  public canvasHeight: number = canvasHeight;
  public canvasWidth: number = canvasWidth;
  public ctx!: CanvasRenderingContext2D;

  constructor(
		private game: GameService,
		private authService: AuthService
	) {}

  ngOnInit(): void {
	userLogin = this.authService.getLoggedInUser();
    this.userLogin = userLogin;
	let tmp: any = this.canvas.nativeElement.getContext('2d');
    if (typeof tmp != 'undefined') {
      this.ctx = tmp;
    }
    paddles.push(new Rectangle(this.ctx, paddleWidth, paddleHeight, 0, this.leftHeight));
    paddles.push(new Rectangle(this.ctx, paddleWidth, paddleHeight ,canvasWidth - paddleWidth, this.rightHeight));
    ball = new Rectangle(this.ctx, ballWidth, ballHeight, -1, -1);
  }


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (room < 0 || this.userLogin == undefined || this.userLogin == '' )
      return ;
    if (event.key == 'ArrowUp') {
      this.game.sendPlayerMove(room, userLogin, 'up');
    }
    if (event.key == 'ArrowDown') {
      this.game.sendPlayerMove(room, userLogin, 'down');
    }
    if (event.key == ' ') {
      this.game.sendPlayerMove(room, userLogin, 'space');
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
          throw('You were already in line');
        case 'Waiting':
          console.log('Waiting');
          result = 'Waiting';
          // add a popout window
          break ;
        case 'Matched':
          console.log('Matched');
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
        sub.unsubscribe();
        hideItem[0] = true;
        hideScore[0] = false;
      }
    }
  }

  DealWithGameStatus(info: any) {
    try {
      this.GameStatus = '';
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
          this.GameStatus = 'Ready';
          room = data.content.room;
          break ;
        // case 'Start':
        //   this.GameStatus = 'Start';
        //   break ;
        case 'Finish':
          result = '';
          room = -1;
          this.GameStatus = 'Finish';
          break ;
        default:
          result = '';
          room = -1;
          this.GameStatus = '';
          throw('ServerError: Game Status Unknown Content\n' + data.content);
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally {
      if (this.GameStatus == 'Ready') {
        // other things dissapear
        // todo
        paddles[0].draw('red');
        paddles[1].draw('blue');
      }
      // if (this.GameStatus == 'Start') {
      //   console.log('Start');
      //   // todo: move ball
      // }
      if (this.GameStatus == 'Finish') {
        ball.clean();
        GameSub.unsubscribe();
        PlayerSub.unsubscribe();
        BallSub.unsubscribe();
        hideItem[1] = false;
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
      if (this.userLogin == undefined || this.userLogin == '')
        this.userLogin = userLogin;
      if (data.content.id == this.userLogin) {
        this.leftHeight = data.content.height;
        points[0] = data.content.point;

        if (this.rightHeight == undefined)
          this.rightHeight = canvasHeight / 2 - paddleHeight / 2;
        // if (!this.Points[1])
        //   this.Points[1] = 0;
      }
      else {
        opponentLogin[0] = data.content.id;
        this.rightHeight = data.content.height;
        points[1] = data.content.point;
        if (this.leftHeight == undefined)
          this.leftHeight = canvasHeight / 2 - paddleHeight / 2;
        // if (!this.Points[0])
        //   this.Points[0] = 0;
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally {

      paddles[0].yPos = this.leftHeight;
      paddles[1].yPos = this.rightHeight;
      // console.log(toRealHeight(canvasHeight, this.leftHeight).toString() + ' ' + this.rightHeight.toString());
      paddles[0].draw('red');
      paddles[1].draw('blue');
      // console.log('My Position(left): ' + this.leftHeight.toString() + ' Opponent Position(right): ' + this.rightHeight.toString() + '\
                //  \nMy Point(left)   : ' + this.Points[0].toString() +    ' Opponent Point(right)   : ' + this.Points[1].toString()) ;
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
      if (this.userLogin == undefined || this.userLogin == '')
        this.userLogin = userLogin;
      if (data.content.id == this.userLogin) { // player1
        ball.xPos = data.content.x;
        ball.yPos = data.content.y;
      }
      else { // player2
        ball.xPos = canvasWidth - ballWidth - data.content.x;
        ball.yPos = data.content.y;
      }
    }
    catch(err: any) {
      alert(err);
    }
    finally {
      ball.draw(ballColor);
    }
  }


  RandomGame(): void {
    // console.log('A');
    if (result == 'Waiting') {
      return ;
    }
    if (result == 'Matched') {
      alert('You\'re already in game');
      return ;
    }
    sub = this.game.getRoomResponse().subscribe(this.DealWithRoomResponse);
    GameSub = this.game.getGameStatus().subscribe(this.DealWithGameStatus);
    PlayerSub = this.game.getPlayerInformation().subscribe(this.DealWithPlayerInformation);
    BallSub = this.game.getBallInformation().subscribe(this.DealWithBallInformation);
    // if (result != 'Waiting')
    this.game.sendRoomRequest(this.userLogin, '');

    // setTimeout(()=>{
    //   if (!sub.closed) {
    //     sub.unsubscribe();
    //     alert('Server didn\'t respond');
    //   }
    // }, 1000);
  }

  BackToMatch(): void {
    ball.clean2(0,0,canvasWidth,canvasHeight);
    hideItem[0] = false;
    hideScore[0] = true;
    hideItem[1] = true;
  }
}