import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMessageDto } from '../dto/message.dto';
import { MessageEntity } from '../model/entities/message.entity';

@Injectable()
export class MessageService {
constructor(
	@InjectRepository(MessageEntity)
	private readonly messageRepository: Repository<MessageEntity>
) {}


//TODO improve
async createMessage(messageDto: CreateMessageDto) {
	console.log('Start creating message');
	const newMessage = this.messageRepository.create(messageDto);
	await this.messageRepository.save(newMessage);
	return newMessage;
}

findAll() {
	return `This action returns all chat`;
}

findOne(id: number) {
	return `This action returns a #${id} chat`;
}

remove(id: number) {
	return `This action removes a #${id} chat`;
}
}
