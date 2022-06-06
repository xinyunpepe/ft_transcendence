import { Controller } from "@nestjs/common";
import { ChannelService } from "../services/channel.service";

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelservice: ChannelService) {}
}
