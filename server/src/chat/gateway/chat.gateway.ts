import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/message.dto';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { ChannelService } from '../services/channel.service';
import { ChannelI } from '../model/interface/channel.interface';
import { UserI } from 'src/user/model/interface/user.interface';

/*
** Unlike controller who works with urls
** Gateway works with events
*/

// For testing
@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] }})
// @WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	/*
	** Reference to socket.io to emit messages to users
	*/
	@WebSocketServer()
	server: Server

	// To test what to show once connected
	title: string[] = [];

	constructor(
		private readonly channelService: ChannelService,
		private readonly messageService: MessageService,
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any) {
		this.server.emit('message', 'test');
	}

	@SubscribeMessage('createMessage')
	createMessage(@MessageBody() messageDto: CreateMessageDto) {
		const newMessage = this.messageService.createMessage(messageDto);

		this.server.emit('message', newMessage);

		return newMessage;
	}

	@SubscribeMessage('findAllChat')
	findAll() {
		return this.messageService.findAll();
	}

	@SubscribeMessage('findOneChat')
	findOne(@MessageBody() id: number) {
		return this.messageService.findOne(id);
	}

	@SubscribeMessage('removeChat')
	remove(@MessageBody() id: number) {
		return this.messageService.remove(id);
	}

	async handleConnection(socket: Socket) {
		try {
			console.log('Start handling connection');
			const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
			const user: UserI = await this.userService.getOne(decodedToken.login);
			if (!user) {
				socket.emit('Error', new UnauthorizedException());
				socket.disconnect();
			} else {
				socket.data.user = user;
				// console.log('socket.data.user ' + JSON.stringify(socket.data.user));

				// emit channels to current connected user
				const channels = await this.channelService.getChannelsForUser(user.login, { page: 1, limit: 20 });
				return this.server.to(socket.id).emit('channels', channels);
			}
		}
		catch {
			socket.emit('Error', new UnauthorizedException());
			socket.disconnect();
		}
	}

	handleDisconnect(socket: Socket) {
		console.log('Gateway disconnected');
		socket.disconnect();
	}

	@SubscribeMessage('createChannel')
	async onCreateChannel(socket: Socket, channel: ChannelI) {
		// const newChannel = await this.channelService.createChannel(channel, socket.data.user);

		// for(const user of newChannel.users) {

		// }
		console.log('Gateway create channel');

		// const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
		// const user: UserI = await this.userService.getOne(decodedToken.login);
		// socket.data.user = user;

		return this.channelService.createChannel(channel, socket.data.user);
	}

}
