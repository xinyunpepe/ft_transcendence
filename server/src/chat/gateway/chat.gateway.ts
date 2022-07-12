import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from '../services/message.service';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ChannelService } from '../services/channel.service';
import { ChannelI } from '../model/channel/channel.interface';
import { UserI } from 'src/user/model/user/user.interface';
import { PageI } from '../model/page.interface';
import { ConnectedUserService } from '../services/connected-user.service';
import { ConnectedUserI } from '../model/connected-user/connected-user.interface';
import { JoinedChannelService } from '../services/joined-channel.service';
import { MessageI } from '../model/message/message.interface';
import { JoinedChannelI } from '../model/joined-channel/joined-channel.interface';

/*
** Unlike controller who works with urls
** Gateway works with events
*/

// For testing
@WebSocketGateway({ cors: { origin: ['http://localhost:3000', 'http://localhost:4200'] }})
// @WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
	/*
	** Reference to socket.io to emit messages to users
	*/
	@WebSocketServer()
	server: Server

	// To test what to show once connected
	title: string[] = [];

	constructor(
		private channelService: ChannelService,
		private messageService: MessageService,
		private authService: AuthService,
		private userService: UserService,
		private connectedUserService: ConnectedUserService,
		private joinedChannelService: JoinedChannelService
	) {}

	async onModuleInit() {
		await this.connectedUserService.deleteAll();
		await this.joinedChannelService.deleteAll();
	}

	async handleConnection(socket: Socket) {
		try {
			console.log('Start handling connection');
			const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
			const user: UserI = await this.userService.findOne(decodedToken.login);
			if (!user) {
				socket.emit('Error', new UnauthorizedException());
				socket.disconnect();
			} else {
				socket.data.user = user;
				const channels = await this.channelService.getChannelsForUser(user.login, { page: 1, limit: 10 });

				// substract page -1 to match the angular material paginator
				channels.meta.currentPage = channels.meta.currentPage - 1;

				// save connected users to DB
				await this.connectedUserService.create({ socketId: socket.id, user })

				// emit channels to current connected user
				return this.server.to(socket.id).emit('channels', channels);
			}
		}
		catch {
			socket.emit('Error', new UnauthorizedException());
			socket.disconnect();
		}
	}

	async handleDisconnect(socket: Socket) {
		console.log('Gateway disconnected');

		//remove connected users from DB
		await this.connectedUserService.deleteBySocketId(socket.id);

		socket.disconnect();
	}

	@SubscribeMessage('createChannel')
	async onCreateChannel(socket: Socket, channel: ChannelI) {
		const creator = socket.data.user;
		const newChannel = await this.channelService.createChannel(channel, creator);

		for (const user of newChannel.users) {
			const connections: ConnectedUserI[] = await this.connectedUserService.findByUser(user);
			const channels = await this.channelService.getChannelsForUser(user.login, { page: 1, limit: 10 });

			// substract page -1 to match the angular material paginator
			channels.meta.currentPage = channels.meta.currentPage - 1;

			for (const connection of connections) {
				await this.server.to(connection.socketId).emit('channels', channels);
			}
		}
	}

	@SubscribeMessage('paginateChannels')
	async onPaginateChannel(socket: Socket, page: PageI) {
		page.limit = page.limit > 100 ? 100 : page.limit;

		// add page +1 to match angular material paginator
		page.page = page.page + 1;

		const login = socket.data.user.login;
		const channels = await this.channelService.getChannelsForUser(login, page);

		// substract page -1 to match the angular material paginator
		channels.meta.currentPage = channels.meta.currentPage - 1;

		return this.server.to(socket.id).emit('channels', channels);
	}

	@SubscribeMessage('joinChannel')
	async onJoinChannel(socket: Socket, channel: ChannelI) {
		const messages = await this.messageService.findMessageForChannel(channel, { page: 1, limit: 30 });
		messages.meta.currentPage = messages.meta.currentPage - 1;

		// save connections to Channel
		const user = socket.data.user;
		const test = await this.joinedChannelService.create({ socketId: socket.id, user: user, channel });
		await this.joinedChannelService.create({ socketId: socket.id, user: user, channel });
		// send last messages from Channel to User
		await this.server.to(socket.id).emit('messages', messages);
	}

	@SubscribeMessage('leaveChannel')
	async onLeaveChannel(socket: Socket) {
		// remove connections from JoinedChannel
		await this.joinedChannelService.deleteBySocketId(socket.id);
	}

	@SubscribeMessage('addMessage')
	async onAddMessage(socket: Socket, message: MessageI) {
		const user = socket.data.user;
		const newMessage: MessageI = await this.messageService.create({ ...message, user: user });
		const channel: ChannelI = await this.channelService.getChannel(newMessage.channel.id);
		const joinedUsers: JoinedChannelI[] = await this.joinedChannelService.findByChannel(channel);
		
		for (const user of joinedUsers) {
			await this.server.to(user.socketId).emit('messageAdded', newMessage);
		}
	}
}
