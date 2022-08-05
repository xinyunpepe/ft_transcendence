import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, Observable, startWith, Subscription, tap } from 'rxjs';
import { ChannelI } from 'src/app/model/channel.interface';
import { MessagePaginateI } from 'src/app/model/message.interface';
import { UserI, UserRole } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { ChatService } from '../../services/chat/chat.service';
import { UserService } from '../../services/user/user.service';

var GameInvitationResponseSubscription: Subscription;
var routers: Router[] = [];
var routes: ActivatedRoute[] = [];

@Component({
  selector: 'app-chat-channel',
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.css']
})
export class ChatChannelComponent implements OnChanges, OnDestroy, AfterViewInit, OnInit {

	@Input() chatChannel: ChannelI;
	@ViewChild('messages') private messagesScroller: ElementRef;

	user: UserI = this.authService.getLoggedInUser();
	isOwner: boolean = false;
	isAdmin: boolean = false;

	messagesPaginate$: Observable<MessagePaginateI> = combineLatest([this.chatService.getMessages(), this.chatService.getAddedMessage().pipe(startWith(null))]).pipe(
		map(([messagePaginate, message]) => {
			if (message && message.channel.id === this.chatChannel.id && !messagePaginate.items.some(m => m.id === message.id)) {
				messagePaginate.items.push(message);
			}
			const items = messagePaginate.items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			messagePaginate.items = items;

			this.userService.findById(this.user.id).subscribe(user => {
				this.user = user;
				console.log(this.chatChannel);

				// check if the current user is the channel owner
				if (this.chatChannel.owner && this.chatChannel.owner.id === this.user.id) {
					this.isOwner = true;
				}
				else {
					this.isOwner = false;
				}

				// check if the current user is the channel admin
				if (this.chatChannel.admin && this.chatChannel.admin.some(m => m.id === this.user.id) ||
				this.user.channelRole === UserRole.ADMIN || this.user.channelRole === UserRole.OWNER) {
					this.isAdmin = true;
				}
				else {
					this.isAdmin = false;
				}
			})

			if (this.chatChannel.mute && this.chatChannel.mute.some(m => m.id === this.user.id)) {
				this.chatMessage.disable();
				this.chatMessage.setValue('You are muted');
			}
			else {
				this.chatMessage.enable();
				this.chatMessage.setValue('');
			}
			return messagePaginate;
		}),
		tap(() => this.scrollToBottom())
	)

	chatMessage: FormControl = new FormControl(null, [Validators.required]);

	constructor(
		private chatService: ChatService,
		private authService: AuthService,
		private userService: UserService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private snackbar: MatSnackBar
	) {
		if (routers === []) {
			routers.push(router);
		}
		else {
			routers[0] = router;
		}
		if (routes === []) {
			routes.push(activatedRoute);
		}
		else {
			routes[0] = activatedRoute;
		}
	}

	handleGameInvitationResponse(response) {
		if (response == 'Accepted') {
			routers[0].navigate(['../game'], { relativeTo: routes[0]});
		}
		else if (response == 'Refused') {

		}
		else {
			this.snackbar.open(`Error from game invitation response`, 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
	}

	ngOnInit() {
		GameInvitationResponseSubscription = this.chatService.getGameInvitationResponse().subscribe(this.handleGameInvitationResponse);
		this.chatService.sendChatConnect(this.user.id, this.user.username);
	}

	ngAfterViewInit(){
		this.scrollToBottom();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.chatService.leaveJoinedChannel(changes['chatChannel'].previousValue);
		if (this.chatChannel) {
			this.chatService.joinChannel(this.chatChannel);
		}
	}

	ngOnDestroy() {
		this.chatService.sendChatDisconnect(this.user.id);
		this.chatService.leaveJoinedChannel(this.chatChannel);
		GameInvitationResponseSubscription.unsubscribe();
	}

	sendMessage() {
		if (this.chatMessage.valid) {
			this.chatService.sendMessage({ text: this.chatMessage.value, channel: this.chatChannel, type: 0 });
			this.chatMessage.reset();
		}
	}

	inviteGame() {
		this.chatService.inviteGame({ text: 'Game Invitation', channel: this.chatChannel, type: 1 }, this.user.id);
		this.chatMessage.reset();
	}

	joinGame(messageId: number, id: number) {
		this.chatService.sendGameInivitation(id, this.user.id, 0, 0);
		this.chatService.deleteMessage(messageId).subscribe();
	}

	accessProfile(userId: number) {
		this.router.navigate(['../profile/' + userId], { relativeTo: this.activatedRoute });
	}

	leaveChannel() {
		this.chatService.leaveChannel(this.chatChannel);
		window.location.reload();
	}

	editChannel(channelId: number) {
		this.router.navigate(['../edit-channel/' + channelId], { relativeTo: this.activatedRoute });
	}

	scrollToBottom() {
		try {
			setTimeout(() => { this.messagesScroller.nativeElement.scrollTop = this.messagesScroller.nativeElement.scrollHeight }, 1);
		}
		catch {}
	}
}
