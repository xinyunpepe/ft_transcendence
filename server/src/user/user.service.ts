import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>
	) {}

	async findAllUser() {
		// const users = await this.userRepository.find();
		// if (!users)
		// 	throw new NotFoundException("Users do not exist");
		// return users;
		return await this.userRepository.find();
	}

	async findOneUser(login: string) {
		// const user = await this.userRepository.findOne({ login: login });
		// if (!user)
		// 	throw new NotFoundException("User does not exist");
		// return user;
		return await this.userRepository.findOne({ login: login });
	}

	async createUser(userDto: CreateUserDto) {
		// Verify users existant again or not?
		console.log('Start creating user');
		const userExist = await this.userRepository.findOne({ login: userDto.login });
		if (userExist)
			return { message: "User exist already"};
		const newUser = this.userRepository.create(userDto);
		return this.userRepository.save(newUser);
	}

	async updateUserStatus(login: string, status: string) {
		return this.userRepository.update({ login }, { status: status });
	}

	async updateUser(id: number, userDto: UpdateUserDto) {
		const user = await this.userRepository.findOne({ id: id });
		if (!user)
			throw new NotFoundException("User does not exist");
		return this.userRepository.update(id, userDto);
	}

	async deleteUser(id: number) {
		const user = await this.userRepository.findOne({ id: id });
		if (!user)
			throw new NotFoundException("User does not exist");
		return this.userRepository.delete(id);
	}
}
