import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/model/user/user.entity";
import { Repository } from "typeorm";
import { ChannelI, ChannelType } from "../model/channel/channel.interface";
import { ChannelEntity } from "../model/channel/channel.entity";
import { UserI } from "src/user/model/user/user.interface";
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import * as bcrypt from 'bcrypt';

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

		if (channel.password) {
			channel.type = ChannelType.PROTECTED;
			// TODO fix bcrypt
			// const hashedPassword = await bcrypt.hash(channel.password, 12);
			channel.password = channel.password;
		}
		channel.owner = creator;
		console.log(channel.owner);
		const newChannel = await this.addCreator(channel, creator);
		const newChannelAdmin = await this.addAdmin(newChannel, creator);
		return this.channelRepository.save(newChannelAdmin);
	}

	async saveChannel(channel: ChannelI){
		return this.channelRepository.save(channel);
	}

	async addCreator(channel: ChannelI, creator: UserI) {
		channel.users.push(creator);
		return channel;
	}

	async addAdmin(channel: ChannelI, user: UserI) {
		channel.admin.push(user);
		return channel;
	}

	async addMute(channel: ChannelI, user: UserI) {
		channel.mute.push(user);
		return channel;
	}

	async removeAdmin(channelId: number, userId: number) {
		const channel = await this.getChannel(channelId);
		channel.admin = channel.admin.filter(user => user.id !== userId);
		return this.channelRepository.save(channel);
	}

	async removeMute(channelId: number, userId: number) {
		const channel = await this.getChannel(channelId);
		channel.mute = channel.mute.filter(user => user.id !== userId);
		return this.channelRepository.save(channel);
	}

	async getChannel(channelId: number) {
		return this.channelRepository.findOne({
			where: [{ id: channelId }],
			relations: ['users', 'owner', 'admin', 'mute']
		});
	}

	async deleteUser(userId: number, channelId: number) {
		const channel = await this.getChannel(channelId);
		const indexOfUser = channel.users.findIndex((user) => {
			return user.id === userId;
		});
		if (indexOfUser !== -1) {
			channel.users.splice(indexOfUser, 1);
		}
		return this.channelRepository.save(channel);
	}

	async getChannelsForUser(userId: number, options: IPaginationOptions) {
		// console.log('Getting channels for user');
		const query = this.channelRepository
			// assign alias 'channel' to channel table when creating a quiry builder
			// equivalent to SELECT ... FROM channel channel
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.users', 'users')
			// SELECT ... FROM channel channel WHERE users.id = userId
			.where('users.id = :userId', { userId })
			// first argument - relation to load, second argument - alias
			.leftJoinAndSelect('channel.users', 'all_users')
			.leftJoinAndSelect('channel.admin', 'all_admin')
			.leftJoinAndSelect('channel.mute', 'all_mute')
			.leftJoinAndSelect('channel.owner', 'owner')
			.orderBy('channel.updatedAt', 'DESC')

		return paginate(query, options);
	}

	isUserMuted(userId: number, channel: ChannelI) {
		const query = this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.mute', 'mute')
			.where('mute.id = :userId', { userId })
			.andWhere('channel.id = :channelId', { channelId: channel.id })
			.getCount();

		return (query);
	}

	isUserAdmin(userId: number, channel: ChannelI){
		const query = this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.admin', 'admin')
			.where('admin.id = :userId', { userId })
			.andWhere("channel.id = :channelId", { channelId: channel.id  })
			.getCount();

		return (query);
	  }
}
