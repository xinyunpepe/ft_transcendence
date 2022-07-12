import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserI } from 'src/user/model/user/user.interface';
import { Repository } from 'typeorm';
import { ConnectedUserEntity } from '../model/connected-user/connected-user.entity';
import { ConnectedUserI } from '../model/connected-user/connected-user.interface';

@Injectable()
export class ConnectedUserService {
	constructor(
		@InjectRepository(ConnectedUserEntity)
		private readonly connectedUserRepository: Repository<ConnectedUserEntity>
	) {}

	async create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
		return this.connectedUserRepository.save(connectedUser);
	}

	async findByUser(user: UserI): Promise<ConnectedUserI[]> {
		return this.connectedUserRepository.find({ where: { user: user } });
	}

	async deleteBySocketId(socketId: string) {
		return this.connectedUserRepository.delete({ socketId });
	}

	async deleteAll() {
		await this.connectedUserRepository
			.createQueryBuilder()
			.delete()
			.execute();
	}
}
