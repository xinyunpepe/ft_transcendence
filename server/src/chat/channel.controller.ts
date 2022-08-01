import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { ChannelService } from "./services/channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private channelservice: ChannelService) {}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async getChannel(
		@Param('id') id: number
	) {
		return this.channelservice.getChannel(id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':channelId/:userId')
	async isInChannel(
		@Param('channelId') channelId: number,
		@Param('userId') userId: number
	) {
		let channel = await this.channelservice.getChannel(channelId);
		return this.channelservice.isUserJoined(userId, channel);
	}

}
