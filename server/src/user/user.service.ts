import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest_Status } from './interfaces/friend-request.interface';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { FriendRequestEntity } from './entities/friend-request.entity';
import { UserEntity } from './entities/user.entity';
import { User_Status } from './interfaces/status.interface';
import { MatchHistoryEntity } from './entities/match-history.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(FriendRequestEntity)
		private readonly friendRequestRepository: Repository<FriendRequestEntity>,
		@InjectRepository(MatchHistoryEntity)
		private readonly matchHistoryRepository: Repository<MatchHistoryEntity>
	) {}

	/*
	** ========== User info ==========
	*/

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

	async updateUserName(login: string, username: string) {
		const user = await this.userRepository.findOne({ login: login });
		if (user)
			return this.userRepository.update({ login }, { username: username });
		throw new NotFoundException("User does not exist");
	}

	async updateUserAvatar(login: string, avatar: string) {
		const user = await this.userRepository.findOne({ login: login });
		if (user)
			return this.userRepository.update({ login }, { avatar: avatar });
		throw new NotFoundException("User does not exist");
	}

	async updateUserStatus(login: string, status: string) {
		return this.userRepository.update({ login }, { status: status });
	}

	async getUserStatus(login: string) {
		const user = await this.userRepository.findOne({ login: login });
		if (user)
			return user.status as User_Status;
	}

	//where AND or OR?
	async getMatchHistory(login: string) {
		const currentUser = await this.findOneUser(login);
		return await this.matchHistoryRepository.find({
			where: [
				{ winner: currentUser },
				{ loser: currentUser }
			],
			relations: ['winner', 'loser']
		});
	}

	/*
	** ========== Two factor auth ==========
	*/

	async setTwoFactorAuthSecret(secret: string, login: string) {
		return this.userRepository.update({ login }, { twoFactorAuthSecret: secret });
	}

	async turnOnTwoFactorAuth(login: string) {
		return this.userRepository.update({ login }, { isTwoFactorAuthEnabled: true });
	}

	async turnOffTwoFactorAuth(login: string) {
		return this.userRepository.update({ login }, { isTwoFactorAuthEnabled: false });
	}

	/*
	** ========== Friend request ==========
	*/
	async findRequestById(requestId: number) {
		return await this.friendRequestRepository.findOne({
			where: [{ id: requestId }],
			relations: ['creator', 'receiver']
		});
	}

	async findRequestByReceiver(receiverLogin: string) {
		const receiver = await this.findOneUser(receiverLogin);
		return await this.friendRequestRepository.findOne({
			where: [{ receiver: receiver }],
			relations: ['creator', 'receiver']
		});
	}

	async findRequestByCreator(creatorLogin: string) {
		const creator = await this.findOneUser(creatorLogin);
		return await this.friendRequestRepository.findOne({
			where: [{ creator: creator }],
			relations: ['creator', 'receiver']
		});
	}

	/*
	** Check if the friend request is sending to oneself
	** Check if the receiver exist
	** 	- if the request exist
	** 		- if it's a received request and its status is pending/accepted, throw error
	**		- if it's a send request and its status is pending/accepted, throw error
	** 	- else create a new request
	*/
	async sendFriendRequest(creatorLogin: string, receiverLogin: string) {
		if (receiverLogin === creatorLogin)
			throw new Error("You cannot send a friend request to yourself");
		const receiver = await this.findOneUser(receiverLogin);
		const creator = await this.findOneUser(creatorLogin);
		if (!receiver)
			throw new NotFoundException("User does not exist");
		if (this.existFriendRequest(receiver, creator)) {
			const receivedRequest = await this.friendRequestRepository.findOne({ creator: receiver, receiver: creator });
			if (receivedRequest) {
				if (receivedRequest.status === 'pending')
					throw new Error(`A friend request has been send from ${ receiverLogin }`);
				else if (receivedRequest.status === 'accepted')
					throw new Error(`You and ${ receiverLogin } are already friends`);
			}
			const sentRequest = await this.friendRequestRepository.findOne({ creator: creator, receiver: receiver });
			if (sentRequest) {
				if (sentRequest.status === 'pending')
					throw new Error(`A friend request has been sent to ${ receiverLogin }`);
				else if (sentRequest.status === 'declined')
					throw new Error(`Your friend request to ${ receiverLogin } has been declined`);
				else if (sentRequest.status === 'accepted')
					throw new Error(`You and ${ receiverLogin } are already friends`);
			}
		}
		console.log('Start sending friend request');
		const newRequest = this.friendRequestRepository.create({
			creator: creator,
			receiver: receiver,
			status: 'pending'
		})
		this.friendRequestRepository.save(newRequest);
	}

	// Check friend-request database if the request exists already
	async existFriendRequest(creator: UserEntity, receiver: UserEntity) {
		const exsitRequest = await this.friendRequestRepository.findOne({
			where: [{ creator: creator, receiver: receiver }]
		});
		if (exsitRequest)
			return true;
		return false;
	}

	async responseToFriendRequest(requestId: number, response: FriendRequest_Status) {
		const exsitRequest = await this.findRequestById(requestId);
		if (exsitRequest)
			return this.friendRequestRepository.update(requestId, { status: response }); //or find & save?
	}

	async findFriends(userLogin: string) {
		const currentUser = await this.findOneUser(userLogin);
		let acceptedList = await this.friendRequestRepository.find({
			where: [
				{ creator: currentUser, status: 'accepted' },
				// { receiver: user, status: 'accepted' }
			],
			relations: ['creator', 'receiver']
		});

		// console.log(acceptedList);

		let friendsList: number[] = [];

		acceptedList.forEach((e) => {
			if (e.creator.login === userLogin)
				friendsList.push(e.receiver.id);
			else if (e.receiver.login === userLogin)
				friendsList.push(e.creator.id);
		});
		return this.userRepository.findByIds(friendsList);
	}
}
