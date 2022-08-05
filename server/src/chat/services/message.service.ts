import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { UserEntity } from 'src/user/model/user/user.entity';
import { UserI } from 'src/user/model/user/user.interface';
import { Repository } from 'typeorm';
import { ChannelI } from '../model/channel/channel.interface';
import { MessageEntity } from '../model/message/message.entity';
import { MessageI } from '../model/message/message.interface';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessageEntity)
		private readonly messageRepository: Repository<MessageEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>
	) { }

	async create(message: MessageI) {
		return this.messageRepository.save(this.messageRepository.create(message));
	}

	async findMessageForChannel(channel: ChannelI, user: UserI, options: IPaginationOptions) {
		// get blocked users
		const blockUser = this.userRepository
			.createQueryBuilder('user')
			.leftJoin('user.receivedFriendRequest', 'received')
			.where('received.creator = :id')
			.andWhere("received.status = 'blocked'")
			.setParameters({ id: user.id })
			.getMany();

		const blockIds = (await blockUser).map(block => block.id);

		// if there are blocked user in the channel, filter out their messages
		if (blockIds.length > 0) {
			const query = this.messageRepository
				.createQueryBuilder('message')
				.leftJoin('message.channel', 'channel')
				.leftJoinAndSelect('message.user', 'user')
				.where('channel.id = :channelId', { channelId: channel.id })
				.andWhere('user.id NOT IN (:...blockIds)')
				.setParameters({ blockIds: blockIds })
				.orderBy('message.createdAt', 'DESC');

			return paginate(query, options);
		}
		else {
			const query = this.messageRepository
				.createQueryBuilder('message')
				.leftJoin('message.channel', 'channel')
				.leftJoinAndSelect('message.user', 'user')
				.where('channel.id = :channelId', { channelId: channel.id })
				.orderBy('message.createdAt', 'DESC');

			return paginate(query, options);
		}
	}
}
