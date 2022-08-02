import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./services/channel.service";
import { ChannelEntity } from "./model/channel/channel.entity";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { MessageEntity } from "./model/message/message.entity";
import { ChatGateway } from "./gateway/chat.gateway";
import { MessageService } from "./services/message.service";
import { ConnectedUserService } from "./services/connected-user.service";
import { ConnectedUserEntity } from "./model/connected-user/connected-user.entity";
import { JoinedChannelEntity } from "./model/joined-channel/joined-channel.entity";
import { JoinedChannelService } from "./services/joined-channel.service";

@Module({
	imports: [
		AuthModule,
		UserModule,
		TypeOrmModule.forFeature([
			ChannelEntity,
			ConnectedUserEntity,
			MessageEntity,
			JoinedChannelEntity
		])
	],
	providers: [
		ChannelService,
		MessageService,
		ConnectedUserService,
		JoinedChannelService,
		ChatGateway
	],
	controllers: [ChannelController],
})
export class ChatModule {}
