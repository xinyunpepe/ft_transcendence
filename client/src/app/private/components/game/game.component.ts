import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GameService } from '../../services/game/game.service';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { FormBuilder, FormControl } from '@angular/forms';
import { Rectangle } from './rectangle';
import { competitionEnumerator, customizationEnumerator } from '../../services/game/enumerators';
import { UserService } from '../../services/user/user.service';
import { UserI } from 'src/app/model/user.interface';

const canvasWidth: number = 600;
const canvasHeight: number = 450;
const paddleWidth: number = 12;
const paddleHeight: number = 30;
const ballWidth: number = 10;
const ballHeight: number = 10;
const ballColor: string = 'black';
const paddle0Color: string = 'red';
const paddle1Color: string = 'blue';

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
var CompetitionType: string[] = [''];
var GameCustomization: string[] = [''];

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

  private user: UserI = this.authService.getLoggedInUser();

  public readonly canvasHeight: number = canvasHeight;
  public readonly canvasWidth: number = canvasWidth;

  public Logins: string[] = Logins;
  public hideItem: boolean[] = hideItem;
  public Points: number[] = points;
  public roomNumber: number[] = room;
  public CompetitionType: string[] = CompetitionType;
  public GameCustomization: string[] = GameCustomization;
  @ViewChild('myCanvas', {static: true})canvas!: ElementRef<HTMLCanvasElement>;
  
  public ctx!: CanvasRenderingContext2D;
  public watchForm = this.formBuilder.group({
    number: ''
  });
  public gameForm = this.formBuilder.group({
    competitionType: 'any',
    gameCustomization: 'any'
  });

  constructor(
		private game: GameService,
    private userService: UserService,
		private authService: AuthService,
    private formBuilder: FormBuilder
	) {}

  ngOnInit(): void { // ok
    this.userService.findById(this.user.id).subscribe(user => {
			this.user = user;
      userId = user.id;
      userLogin = user.username;
      this.game.sendGameConnect(userId, userLogin);
		});
    userId = this.user.id;
    userLogin = this.user.username;

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
    if (event.key == 'ArrowLeft') {
      this.game.sendPlayerMove(room[0], userId, 'left');
    }
    if (event.key == 'ArrowRight') {
      this.game.sendPlayerMove(room[0], userId, 'right');
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
      paddles[0].draw(paddle0Color);
      paddles[1].draw(paddle1Color);
    
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

      if (data.hashes === undefined || data.hashes.length != 2) {
        throw('ServerError: Hashes error in ClientInfo');
      }
      CompetitionType[0] = competitionEnumerator[data.hashes[0]];
      GameCustomization[0] = customizationEnumerator[data.hashes[1]];
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

  resetGameForm() {
    // this.gameForm.value.competitionType = 'any';
    // this.gameForm.value.gameCustomization = 'any'; 
    this.gameForm = this.formBuilder.group({
      competitionType: 'any',
      gameCustomization: 'any'
    });
  }

  RandomGame(): void {
    this.game.sendRoomRequest(userId, this.gameForm.value.competitionType, this.gameForm.value.gameCustomization);
    this.resetGameForm();
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
