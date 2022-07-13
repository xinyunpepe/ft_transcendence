import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { combineLatest, map, Observable, startWith, tap } from 'rxjs';
import { ChannelI } from 'src/app/model/channel.interface';
import { MessagePaginateI } from 'src/app/model/message.interface';
import { UserI, UserRole } from 'src/app/model/user.interface';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { ChatService } from '../../services/chat/chat.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-chat-channel',
  templateUrl: './chat-channel.component.html',
  styleUrls: ['./chat-channel.component.css']
})
export class ChatChannelComponent implements OnChanges, OnDestroy, AfterViewInit {

	@Input() chatChannel: ChannelI;
	@ViewChild('messages') private messagesScroller: ElementRef;

	user: UserI = null;
	userLogin = this.authService.getLoggedInUser();
	isOwner: boolean = false;
	isAdmin: boolean = false;

	messagesPaginate$: Observable<MessagePaginateI> = combineLatest([this.chatService.getMessages(), this.chatService.getAddedMessage().pipe(startWith(null))]).pipe(
		map(([messagePaginate, message]) => {
			if (message && message.channel.id === this.chatChannel.id && !messagePaginate.items.some(m => m.id === message.id)) {
				messagePaginate.items.push(message);
			}
			const items = messagePaginate.items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			messagePaginate.items = items;

			this.userService.findByLogin(this.userLogin).subscribe(user => {
				this.user = user;
				if (this.chatChannel.owner && this.chatChannel.owner.id === this.user.id) {
					console.log('IN1');
					this.isOwner = true;
				}
				else {
					console.log('IN2');
					this.isOwner = false;
				}

			// 	if (this.chatChannel.admin && this.chatChannel.admin.some(m => m.id === this.user.id) ||
			// 	this.user.channelRole === UserRole.ADMIN || this.user.channelRole === UserRole.OWNER) {
			// 		console.log('IN3');
			// 		this.isAdmin = true;
			// 	}
			// 	else {
			// 		console.log('IN4');
			// 		this.isAdmin = false;
			// 	}
			})

			// if (this.chatChannel.mute && this.chatChannel.mute.some(m => m.id === this.user.id)) {
			// 	console.log('IN5');
			// 	this.chatMessage.disable();
			// 	this.chatMessage.setValue('You are muted');
			// }
			// else {
			// 	console.log('IN6');
				// this.chatMessage.enable();
				// this.chatMessage.setValue('');
			// }
			return messagePaginate;
		}),
		tap(() => this.scrollToBottom())
	)

	chatMessage: FormControl = new FormControl(null, [Validators.required]);

	constructor(
		private chatService: ChatService,
		private authService: AuthService,
		private userService: UserService
	) {}

	ngAfterViewInit(){
		this.scrollToBottom();
	}

	ngOnChanges(changes: SimpleChanges) {
		this.chatService.leaveJoinedChannel(changes['chatChannel'].previousValue);
		if (this.chatChannel) {
			this.chatService.joinChannel(this.chatChannel);
		}
		console.log(this.chatChannel);
	}

	ngOnDestroy() {
		this.chatService.leaveJoinedChannel(this.chatChannel);
	}

	sendMessage() {
		if (this.chatMessage.valid) {
			const test = this.chatService.sendMessage({ text: this.chatMessage.value, channel: this.chatChannel, type: 0 });
			this.chatMessage.reset();
		}
	}

	joinGame(id: number) {

	}

	leaveChannel() {
		// this.chatService.leaveJoinedChannel(this.chatChannel);
		this.chatService.leaveChannel(this.chatChannel);
		window.location.reload();
	}

	editChannel(id: number) {

	}

	scrollToBottom() {
		try {
			setTimeout(() => { this.messagesScroller.nativeElement.scrollTop = this.messagesScroller.nativeElement.scrollHeight }, 1);
		}
		catch {}
	}
}
