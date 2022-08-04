import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { UserService } from "src/user/user.service";
import { ChannelService } from "./services/channel.service";

@Controller('channel')
export class ChannelController {
	constructor(
		private channelservice: ChannelService,
		private userService: UserService
	) {}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async getChannel(
		@Param('id') id: number
	) {
		return this.channelservice.getChannel(id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('direct/:userIdA/:userIdB')
	async getDirectChannel(
		@Param('userIdA') userIdA: number,
		@Param('userIdB') userIdB: number
	) {
		const userA = await this.userService.findUserById(userIdA);
		const userB = await this.userService.findUserById(userIdB);
		return this.channelservice.getDirectChannel(userA.username, userB.username);
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
