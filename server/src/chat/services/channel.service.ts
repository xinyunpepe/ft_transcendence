import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/model/entities/user.entity";
import { Repository } from "typeorm";
import { ChannelI } from "../model/interface/channel.interface";
import { ChannelEntity } from "../model/entities/channel.entity";
import { UserI } from "src/user/model/interface/user.interface";
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

// const bcrypt = require('bcrypt');

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(ChannelEntity)
		private readonly channelRepository: Repository<ChannelEntity>
	) {}

	async createChannel(channel: ChannelI, creator: UserI) {
		console.log('Start creating channel');

		// bcrypt doesnt work???
		// if (channel.password) {
		// 	channel.type = 'protected';
		// 	const hashedPassword = await bcrypt.hash(channel.password, 12);
		// 	channel.password = hashedPassword;
		// }
		console.log(creator);
		channel.owner = creator;
		const newChannel = await this.addCreatorToChannel(channel, creator);
		console.log(newChannel);
		return this.channelRepository.save(newChannel);
	}

	async addCreatorToChannel(channel: ChannelI, creator: UserI) {
		channel.owner = creator;
		channel.users.push(creator);
		return channel;
	}

	// add pagination???
	// async getAllChannels() {
	// 	const query = this.channelRepository
	// 		// assign alias 'channel' to channel table when creating a quiry builder
	// 		// equivalent to SELECT ... FROM channel channel
	// 		.createQueryBuilder('channel')
	// 		// first argument - relation to load, second argument - alias
	// 		.leftJoinAndSelect('channel.owner', 'owner')
	// 		.leftJoinAndSelect('channel.users', 'users')
	// 		// SELECT ... FROM channel channel WHERE channel.type = 'public'
	// 		.where('channel.type = :type', { type: 'public'})
	// 		.getMany()
	// 	return query;
	// }

	async getChannelsForUser(login: string, options: IPaginationOptions) {
		console.log('Getting channels for user');
		const query = this.channelRepository
			.createQueryBuilder('channel')
			.leftJoin('channel.users', 'users')
			.where('users.login = :login', { login })
			.leftJoinAndSelect('channel.users', 'all_users')
			.orderBy('channel.updatedAt', 'DESC')

		return paginate(query, options);
	}



}
