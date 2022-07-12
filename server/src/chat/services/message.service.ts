import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { Repository } from 'typeorm';
import { ChannelI } from '../model/channel/channel.interface';
import { MessageEntity } from '../model/message/message.entity';
import { MessageI } from '../model/message/message.interface';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessageEntity)
		private readonly messageRepository: Repository<MessageEntity>
	) {}

	async create(message: MessageI) {
		return this.messageRepository.save(this.messageRepository.create(message));
	}

	async findMessageForChannel(channel: ChannelI, options: IPaginationOptions) {
		const query = this.messageRepository
			.createQueryBuilder('message')
			.leftJoin('message.channel', 'channel')
			.where('channel.id = :channelId', { channelId: channel.id })
			.leftJoinAndSelect('message.user', 'user')
			.orderBy('message.createdAt', 'ASC');

		return paginate(query, options);
	}

}
