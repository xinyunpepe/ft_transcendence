import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { ChannelI, ChannelPaginateI, ChannelType } from 'src/app/model/channel.interface';
import { MessageI, MessagePaginateI } from 'src/app/model/message.interface';
import { UserI } from 'src/app/model/user.interface';
import { CustomSocket } from 'src/app/private/sockets/custom-sockets';
import { AuthService } from 'src/app/public/services/auth/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class ChatService {

	socket: CustomSocket = null;

	constructor(
		private authService: AuthService,
		private http: HttpClient,
		private snackbar: MatSnackBar,
		private router: Router
	) {
		if (this.authService.isAuthenticated) {
			this.socket = new CustomSocket();
		}
	}

	createChannel(channel: ChannelI) {
		this.socket.emit('createChannel', channel);
	}

	emitPaginateChannel(limit: number, page: number) {
		this.socket.emit('paginateChannels', { limit, page });
	}

	emitPaginateAllChannel(limit: number, page: number) {
		this.socket.emit('paginateAllChannels', { limit, page });
	}

	joinChannel(channel: ChannelI) {
		this.socket.emit('joinChannel', channel);
	}

	leaveJoinedChannel(channel: ChannelI) {
		this.socket.emit('leaveJoinedChannel', channel);
	}

	leaveChannel(channel: ChannelI) {
		this.socket.emit('leaveChannel', channel);
	}

	addUser(channel: ChannelI, password: string) {
		this.socket.emit('addUser', { channel, password });
	}

	setAdmin(channel: ChannelI, user: UserI) {
		this.socket.emit('setAdmin', { user, channel });
	}

	muteUser(channel: ChannelI, user: UserI) {
		this.socket.emit('muteUser', { user, channel });
	}

	unsetAdmin(channel: ChannelI, user: UserI) {
		this.socket.emit('unsetAdmin', { user, channel });
	}

	unmuteUser(channel: ChannelI, user: UserI) {
		this.socket.emit('unmuteUser', { user, channel });
	}

	changeType(channel: ChannelI) {
		this.socket.emit('changeType', { channel });
	}

	sendMessage(message: MessageI) {
		this.socket.emit('addMessage', message);
	}

	getMessages(): Observable<MessagePaginateI> {
		return this.socket.fromEvent<MessagePaginateI>('messages');
	}

	getChannels(): Observable<ChannelPaginateI> {
		return this.socket.fromEvent<ChannelPaginateI>('channels');
	}

	getAddedMessage(): Observable<MessageI> {
		return this.socket.fromEvent<MessageI>('messageAdded');
	}

	findChannelById(id: number): Observable<ChannelI> {
		return this.http.get<UserI>(`${ environment.baseUrl }/channel/${ id }`).pipe(
			map((channel: ChannelI) => channel)
		);
	}

	joinProtectedChannel(channelId: number, userId: number): Observable<number> {
		return this.http.get<number>(`${ environment.baseUrl }/channel/${ channelId }/${ userId }`).pipe(
			tap(res => {
				if (res < 1) {
					this.snackbar.open('Password failed, try again', 'Close', {
						duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
					});
				}
				else {
					this.snackbar.open('You joined the channel', 'Close', {
						duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
					});
				}
				this.router.navigate(['../../private/dashboard-channel']);
			})
		);
	}
}
