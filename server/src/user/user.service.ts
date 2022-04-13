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
		return await this.userRepository.find();
	}

	async findOneUser(login: string) {
		// const user = await this.userRepository.findOne({ login: login });
		// if (user)
		// 	return user;
		// throw new NotFoundException('User does not exist');
		return await this.userRepository.findOne({ login: login });
	}

	async createUser(userDto: CreateUserDto) {
		console.log('Start creating user');
		const newUser = this.userRepository.create(userDto);
		await this.userRepository.save(newUser);
		return newUser;
	}

	async updateUserStatus(login: string, status: string) {
		return this.userRepository.update({ login }, { status: status });
	}

	async setTwoFactorAuthSecret(secret: string, login: string) {
		return this.userRepository.update({ login }, { twoFactorAuthSecret: secret });
	}

	async turnOnTwoFactorAuth(login: string) {
		return this.userRepository.update({ login }, { isTwoFactorAuthEnabled: true });
	}

	async turnOffTwoFactorAuth(login: string) {
		return this.userRepository.update({ login }, { isTwoFactorAuthEnabled: false });
	}

	async updateUser(id: number, userDto: UpdateUserDto) {
		const user = await this.userRepository.findOne({ id: id });
		if (user)
			return this.userRepository.update(id, userDto);
		throw new NotFoundException("User does not exist");
	}

	async deleteUser(id: number) {
		const user = await this.userRepository.findOne({ id: id });
		if (user)
			return this.userRepository.delete(id);
		throw new NotFoundException("User does not exist");
	}
}
