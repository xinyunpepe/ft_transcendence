import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { CreateChannelDto } from "../dto/channel.dto";
import { ChannelEntity } from "../entities/channel.entity";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(ChannelEntity)
		private readonly channelRepository: Repository<ChannelEntity>
	) {}

	async createChannel(channelDto: CreateChannelDto, creator: UserEntity) {
		console.log('Start creating channel');
		// const newChannel = this.channelRepository.create(channelDto);
		const newChannel = await this.addCreatorToChannel(channelDto, creator);
		await this.channelRepository.save(newChannel);
		return newChannel;
	}

	async addCreatorToChannel(channelDto: CreateChannelDto, creator: UserEntity) {
		channelDto.owner = creator;
		channelDto.users.push(creator);
		return channelDto;
	}

	// add pagination???
	async findAllPublicChannels() {
		const query = this.channelRepository
			// assign alias 'channel' to channel table when creating a quiry builder
			// equivalent to SELECT ... FROM channel channel
			.createQueryBuilder('channel')
			// first argument - relation to load, second argument - alias
			.leftJoinAndSelect('channel.owner', 'owner')
			.leftJoinAndSelect('channel.users', 'users')
			// SELECT ... FROM channel channel WHERE channel.type = 'public'
			.where('channel.type = :type', { type: 'public'})
			.getMany()
		return query;
	}

	async findChannelsByUser(login: string) {
		const query = this.channelRepository
			.createQueryBuilder('channel')
			.leftJoin('channel.users', 'user')
			.where('user.login = :login', { login })
		return query;
	}

	

}
