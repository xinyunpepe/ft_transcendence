import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelController } from "./controllers/channel.controller";
import { ChannelService } from "./services/channel.service";
import { ChannelEntity } from "./entities/channel.entity";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { MessageEntity } from "./entities/message.entity";
import { ChatGateway } from "./gateway/chat.gateway";
import { MessageService } from "./services/message.service";

@Module({
	imports: [
		AuthModule,
		UserModule,
		TypeOrmModule.forFeature([
			// UserEntity,
			ChannelEntity,
			MessageEntity
		])
	],
	providers: [
		ChannelService,
		MessageService,
		ChatGateway
	],
	controllers: [ChannelController],
})
export class ChatModule {}
