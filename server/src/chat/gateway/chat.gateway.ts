import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/message.dto';
import { Socket, Server } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { UnauthorizedException } from '@nestjs/common';

/*
** Unlike controller who works with urls
** Gateway works with events
*/

// For testing
@WebSocketGateway({ cors: { origin: '*' }})
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
		private readonly messageService: MessageService,
		private readonly authService: AuthService,
		private readonly userService: UserService
	) {}

	// @SubscribeMessage('message')
	// handleMessage(client: any, payload: any): string {
	// 	return 'Hello World';
	// }

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
		console.log('Start handling connection');
		const decodedToken = await this.authService.verifyJwt(socket.handshake.headers.authorization);
		console.log('handshake: ', socket.handshake.headers.authorization);
		const user: UserEntity = await this.userService.findOneUser(decodedToken.user.login);
		if (!user) {
			socket.emit('Error', new UnauthorizedException());
			socket.disconnect();
		} else {
			this.title.push('You are connnected as ', user.login);
			this.server.emit('message', this.title);
		}
	}

	handleDisconnect(client: any) {

	}
}
