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
		// check adding self
		let userId;
		this.authService.getUserId().subscribe(id => {
			userId = id;
		})

		if (channel.users.filter(user => { return user.id === userId; }).length > 0) {
			this.snackbar.open('ERROR: You cannot add yourself to the channel', 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}

		// check duplicate
		const tempArr = channel.users.map(user => {
			return user.id
		});

		const hasDuplicate = tempArr.some((user, index) => {
			return tempArr.indexOf(user) !== index;
		});

		if (hasDuplicate) {
			this.snackbar.open('ERROR: Duplicated user', 'Close', {
				duration: 5000, horizontalPosition: 'right', verticalPosition: 'top'
			});
		}
		this.socket.emit('createChannel', channel);
	}

	createDirectChannel(channel: ChannelI) {
		this.socket.emit('createDirectChannel', channel);
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

	removeUser(channel: ChannelI, user: UserI) {
		this.socket.emit('removeUser', { user, channel });
	}

	changeType(channel: ChannelI) {
		this.socket.emit('changeType', { channel });
	}

	sendMessage(message: MessageI) {
		this.socket.emit('addMessage', message);
	}

	inviteGame(message: MessageI, id: number) {
		this.socket.emit('inviteGame', message);
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
		return this.http.get<ChannelI>(`api/channel/${ id }`).pipe(
			map((channel: ChannelI) => channel)
		);
	}

	findDirectChannel(userIdA: number, userIdB: number): Observable<ChannelI> {
		return this.http.get<ChannelI>(`api/channel/direct/${ userIdA }/${ userIdB }`)
	}

	joinProtectedChannel(channelId: number, userId: number): Observable<number> {
		return this.http.get<number>(`api/channel/${ channelId }/${ userId }`).pipe(
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
