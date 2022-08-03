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
      ball = new Rectangle(this.ctx, ballWidth, ballHeight, canvasWidth, canvasHeight);
    }
    else {
      paddles[0].ctx = this.ctx;
      paddles[1].ctx = this.ctx;
      ball.ctx = this.ctx;
    }
    
    WatchSub = this.game.getWatchResponse().subscribe(this.DealWithWatchResponse);
    InfoSub = this.game.getClientInfo().subscribe(this.DealWithClientInfo);

    this.game.sendGameConnect(userId, userLogin);
  }

  ngOnDestroy(): void { // ok
    this.game.sendGameDisconnect(userId);
    WatchSub.unsubscribe();
    InfoSub.unsubscribe();
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
      paddles[0].clean();
      paddles[1].clean();
      ball.clean();
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
      
      paddles[0].yPos = data.Heights[0];
      paddles[1].yPos = data.Heights[1];
      paddles[0].draw('Red');
      paddles[1].draw('Blue');
    
      if ( data.points === undefined || data.points.length != 2) {
        throw('ServerError: Points error in ClientInfo');
      }

      points[0] = data.points[0];
      points[1] = data.points[1];

      if (data.ball === undefined || data.ball.length != 2) {
        throw('ServerError: Ball error in ClientInfo');
      }
      ball.xPos = data.ball[0];
      ball.yPos = data.ball[1];
      ball.draw(ballColor);
    }
    catch(err: any) {
      alert(err);
    }
    finally {
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

  RandomGame(): void {
    this.game.sendRoomRequest(userId);
  }

  Surrender(): void {
    if (room[0] < 0)
      return ;
    this.game.sendSurrender(room[0], userId);
  }

  BackToMatch(): void {
    ball.clean2(0,0,canvasWidth,canvasHeight);
    this.game.sendLeaveGameRoom(userId);
  }

  LeaveWatchingMode(): void {
    ball.clean2(0,0,canvasWidth,canvasHeight);
    this.game.sendLeaveWatching(room[0].toString(), userId);
  }

  Cancel(): void {
    this.game.sendCancelRequest(userId);
  }

  WatchRequest() {
    this.game.sendWatchRequest(this.watchForm.value.number, userId);
    this.watchForm.reset();
  }
}
