import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	findAll(): Promise<User[]> {
		return this.userRepository.find();
	}

	//not working yet
	findOne(id: number): Promise<User> {
		return this.userRepository.findOne({ id: id });
	}

	createUser(user: User): Promise<User> {
		return this.userRepository.save(user);
	}
}
