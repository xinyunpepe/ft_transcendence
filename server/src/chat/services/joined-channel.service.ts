import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChannelI } from "../model/channel/channel.interface";
import { JoinedChannelEntity } from "../model/joined-channel/joined-channel.entity";
import { JoinedChannelI } from "../model/joined-channel/joined-channel.interface";

@Injectable()
export class JoinedChannelService {

	constructor(
		@InjectRepository(JoinedChannelEntity)
		private readonly joinedChannelRepository: Repository<JoinedChannelEntity>
	) {}

	async create(joinedChannel: JoinedChannelI): Promise<JoinedChannelI> {
		return this.joinedChannelRepository.save(joinedChannel);
	}

	// async findByUser(user: UserI) {
	// 	return this.joinedChannelEntity.find({ where: { user: user } });
	// }

	async findByChannel(channel: ChannelI): Promise<JoinedChannelI[]> {
		return this.joinedChannelRepository.find({ relations: ['channel']});
	}

	async deleteBySocketId(socketId: string) {
		return this.joinedChannelRepository.delete({ socketId });
	}

	async deleteAll() {
		await this.joinedChannelRepository
			.createQueryBuilder()
			.delete()
			.execute();
	}
}
