import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChannelI, ChannelType } from "../model/channel/channel.interface";
import { ChannelEntity } from "../model/channel/channel.entity";
import { UserI } from "src/user/model/user/user.interface";
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Observable, of } from "rxjs";
// import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity)
		private readonly channelRepository: Repository<ChannelEntity>
	) {}

	async createChannel(channel: ChannelI, creator: UserI) {
		if (channel.password) {
			channel.type = ChannelType.PROTECTED;
			// TODO fix bcrypt
			// const hashedPassword = await bcrypt.hash(channel.password, 12);
			channel.password = channel.password;
		}
		channel.owner = creator;
		const newChannel = await this.addCreator(channel, creator);
		const newChannelAdmin = await this.addAdmin(newChannel, creator);
		return this.channelRepository.save(newChannelAdmin);
	}

	async createDirectChannel(channel: ChannelI, creator: UserI) {
		channel.users.push(creator);
		channel.owner = creator;
		return this.channelRepository.save(channel);
	}

	async saveChannel(channel: ChannelI){
		return this.channelRepository.save(channel);
	}

	async addCreator(channel: ChannelI, creator: UserI) {
		channel.users.push(creator);
		return channel;
	}

	async addUser(channeiId: number, user: UserI, password: string): Promise<Observable<{ error: string } | { success: string }>> {
		const channel = await this.getChannel(channeiId);
		const isJoined = await this.isUserJoined(user.id, channel);
		if (isJoined) {
			return of({ error: 'Already joined the channel' });
		}
		if (channel.type === ChannelType.PUBLIC) {
			const newChannel = await this.addCreator(channel, user);
			this.channelRepository.save(newChannel);
			return of({ success: 'Channel joined' });
		}
		if (channel.type === ChannelType.PROTECTED) {
			const isMatched: boolean = await this.validatePassword(password, channel.password);
			if (isMatched) {
				const newChannel = await this.addCreator(channel, user);
				this.channelRepository.save(newChannel);
				return of({ success: 'Channel joined' });
			}
			return of({ error: 'Wrong password' });
		}
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

	async changeType(channel: ChannelI, type: ChannelType) {
		channel.type = type;
		return this.channelRepository.save(channel);
	}

	// TODO hash password
	async changePassword(channel: ChannelI, password: string) {
		channel.password = password;
		return this.channelRepository.save(channel);
	}

	async getChannel(channelId: number) {
		return this.channelRepository.findOne({
			where: [{ id: channelId }],
			relations: ['users', 'owner', 'admin', 'mute'],
			select: ['id', 'name', 'type', 'password']
		});
	}

	async getDirectChannel(usernameA: string, usernameB: string) {
		return this.channelRepository.findOne({
			where: [
				{ name: 'Direct Channel ' + usernameA + ' & ' + usernameB },
				{ name: 'Direct Channel ' + usernameB + ' & ' + usernameA }
			]
		});
	}

	async deleteUser(userId: number, channelId: number) {
		const channel = await this.getChannel(channelId);
		if (channel.owner && channel.owner.id === userId) {
			channel.owner = null;
		}
		channel.admin = channel.admin.filter(user => user.id !== userId);
		channel.users = channel.users.filter(user => user.id !== userId);
		this.channelRepository.save(channel);
		return channel;
	}

	async getChannelsForUser(userId: number, options: IPaginationOptions) {
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

	async getAllChannelsForUser(userId: number, options: IPaginationOptions) {
		// TODO could have better filter
		const query = this.channelRepository
			.createQueryBuilder('channel')
			.where('channel.type != :private', { private: ChannelType.PRIVATE })
			.orderBy('channel.updatedAt', 'DESC')

		return paginate(query, options);
	}

	isUserJoined(userId: number, channel: ChannelI) {
		const query = this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.users', 'users')
			.where('users.id = :userId', { userId })
			.andWhere('channel.id = :channelId', { channelId: channel.id })
			.getCount();

		return (query);
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

	// TODO bcypt
	private async validatePassword(password: string, hashedPassword: string) {
		// return bcrypt.compare(password, hashedPassword);
		return password === hashedPassword;
	}
}
