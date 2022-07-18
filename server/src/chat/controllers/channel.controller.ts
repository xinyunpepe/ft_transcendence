import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ChannelService } from "../services/channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private channelservice: ChannelService) {}

	@Get(':id')
	getChannel(
		@Param('id') id: number
	) {
		return this.channelservice.getChannel(id);
	}
}
