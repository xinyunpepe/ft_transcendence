import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChannelI, ChannelPaginateI } from 'src/app/model/channel.interface';
import { MessageI, MessagePaginateI } from 'src/app/model/message.interface';
import { UserI } from 'src/app/model/user.interface';
import { CustomSocket } from 'src/app/private/sockets/custom-sockets';
import { AuthService } from 'src/app/public/services/auth/auth.service';

@Injectable({
	providedIn: 'root'
})
export class ChatService {

	socket: CustomSocket = null;

	constructor(private authService: AuthService) {
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

	joinChannel(channel: ChannelI) {
		this.socket.emit('joinChannel', channel);
	}

	leaveJoinedChannel(channel: ChannelI) {
		this.socket.emit('leaveJoinedChannel', channel);
	}

	leaveChannel(channel: ChannelI) {
		this.socket.emit('leaveChannel', channel);
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
}
