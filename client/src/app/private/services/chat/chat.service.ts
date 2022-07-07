import { Injectable } from '@angular/core';
import { ChannelI, ChannelPaginateI } from 'src/app/model/channel.interface';
import { UserI } from 'src/app/model/user.interface';
import { CustomSocket } from 'src/app/private/sockets/custom-sockets';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

	constructor(private socket: CustomSocket) {}

	getMessage() {
		return this.socket.fromEvent('message');
	}

	getChannels() {
		return this.socket.fromEvent<ChannelPaginateI>('channel');
	}

	emitChannels() {
		this.socket.emit('emitChannels');
	}

	createChannel() {
		console.log('Angular create channel')
		const testUser: UserI = {
			login: 'aaa'
		};

		const channel: ChannelI = {
			name:'testroom',
			users: [testUser],
			type: 'public',
			isPasswordRequired: false,
			isDirect: false
		}
		console.log(this.socket);
		this.socket.emit('createChannel', channel);
	}
}
