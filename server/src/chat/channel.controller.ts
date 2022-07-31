import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ChannelService } from "./services/channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private channelservice: ChannelService) {}

	// TODO auth guard
	@Get(':id')
	async getChannel(
		@Param('id') id: number
	) {
		return this.channelservice.getChannel(id);
	}

	@Get(':channelId/:userId')
	async isInChannel(
		@Param('channelId') channelId: number,
		@Param('userId') userId: number
	) {
		let channel = await this.channelservice.getChannel(channelId);
		return this.channelservice.isUserJoined(userId, channel);
	}

}
