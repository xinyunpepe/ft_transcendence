import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FriendStatus } from './model/friend-request/friend-request.interface';
import { FriendRequestEntity } from './model/friend-request/friend-request.entity';
import { UserEntity } from './model/user/user.entity';
import { MatchHistoryEntity } from './model/match-history/match-history.entity';
import { UserI, UserStatus } from './model/user/user.interface';

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

	async findUserByLogin(login: string) {
		return await this.userRepository.findOne({ where: { login: login }});
	}

	async findAllByUsername(username: string) {
		return await this.userRepository.find({
			where: [
				{ username: Like(`%${username.toLowerCase()}%`) }
			]
		})
	}

	public findUserById(id: number) {
		return this.userRepository.findOne({ where: { id: id }});
	}

	async createUser(user: UserI) {
		console.log('Start creating user');
		const newUser = this.userRepository.create(user);
		await this.userRepository.save(newUser);
		return newUser;
	}

	async deleteUser(id: number) {
		const user = await this.userRepository.findOne({ where: { id: id }});
		if (user)
			return this.userRepository.delete(id);
		throw new NotFoundException("User does not exist");
	}

	async updateUsername(id: number, username: string) {
		const user = await this.userRepository.findOne({ where: { id: id }});
		if (user)
			return this.userRepository.update({ id }, { username: username });
		throw new NotFoundException("User does not exist");
	}

	async updateAvatar(id: number, avatar: string) {
		const user = await this.userRepository.findOne({ where: { id: id }});
		if (user)
			return this.userRepository.update({ id }, { avatar: avatar });
		throw new NotFoundException("User does not exist");
	}

	async onlineStatus(id: number, status: UserStatus.ON) {
		return this.userRepository.update({ id }, { status: status });
	}

	async offlineStatus(id: number, status: UserStatus.OFF) {
		return this.userRepository.update({ id }, { status: status });
	}

	/*
	** ========== Two factor auth ==========
	*/

	async setTwoFactorAuthSecret(secret: string, id: number) {
		return this.userRepository.update({ id }, { twoFactorAuthSecret: secret });
	}

	async turnOnTwoFactorAuth(id: number) {
		return this.userRepository.update({ id }, { isTwoFactorAuthEnabled: true });
	}

	async turnOffTwoFactorAuth(id: number) {
		return this.userRepository.update({ id }, { isTwoFactorAuthEnabled: false });
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

	async findRequestByUser(creatorId: number, receiverId: number) {
		const creator = await this.findUserById(creatorId);
		const receiver = await this.findUserById(receiverId);
		return await this.friendRequestRepository.findOne({
			where: [
				{ creator: creator, receiver: receiver },
				{ creator: receiver, receiver: creator }
			],
			relations: ['creator', 'receiver']
		});
	}

	async findRequestByReceiver(receiverId: number) {
		const receiver = await this.findUserById(receiverId);
		return await this.friendRequestRepository.findOne({
			where: [{ receiver: receiver }],
			relations: ['creator', 'receiver']
		});
	}

	async findRequestsByCreator(creatorId: number) {
		const creator = await this.findUserById(creatorId);
		return await this.friendRequestRepository.find({
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
	async sendFriendRequest(creatorId: number, receiverId: number) {
		if (creatorId === receiverId)
			throw new Error("You cannot send a friend request to yourself");
		const receiver = await this.findUserById(receiverId);
		const creator = await this.findUserById(creatorId);
		if (!receiver)
			throw new NotFoundException("User does not exist");
		if (this.existFriendRequest(receiver, creator)) {
			const receivedRequest = await this.friendRequestRepository.findOne({ where: { creator: receiver, receiver: creator }});
			if (receivedRequest) {
				if (receivedRequest.status === FriendStatus.PENDING)
					throw new Error(`A friend request has been send from ${ receiverId }`);
				else if (receivedRequest.status === FriendStatus.ACCEPTED)
					throw new Error(`You and ${ receiverId } are already friends`);
			}
			const sentRequest = await this.friendRequestRepository.findOne({ where: { creator: creator, receiver: receiver }});
			if (sentRequest) {
				if (sentRequest.status === FriendStatus.PENDING)
					throw new Error(`A friend request has been sent to ${ receiverId }`);
				else if (sentRequest.status === FriendStatus.DECLIEND)
					throw new Error(`Your friend request to ${ receiverId } has been declined`);
				else if (sentRequest.status === FriendStatus.ACCEPTED)
					throw new Error(`You and ${ receiverId } are already friends`);
			}
		}
		const newRequest = this.friendRequestRepository.create({
			creator: creator,
			receiver: receiver,
			status: FriendStatus.PENDING
		})
		this.friendRequestRepository.save(newRequest);
	}

	async removeFriendRequest(creatorId: number, receiverId: number) {
		if (creatorId === receiverId)
			throw new Error("You cannot remove a friend request to yourself");
		const receiver = await this.findUserById(receiverId);
		const creator = await this.findUserById(creatorId);
		if (!receiver)
			throw new NotFoundException("User does not exist");
		const request = await this.friendRequestRepository.findOne({
			where: [
				{ creator: creator, receiver: receiver },
				{ creator: receiver, receiver: creator }
			]
		});
		if (request) {
			this.friendRequestRepository.delete(request);
		}
	}

	// Check friend-request database if the request exists already
	async existFriendRequest(creator: UserEntity, receiver: UserEntity) {
		const exsitRequest = await this.friendRequestRepository.findOne({
			where: [
				{ creator: creator, receiver: receiver }
			]
		});
		if (exsitRequest)
			return true;
		return false;
	}

	async responseToFriendRequest(requestId: number, response: FriendStatus) {
		const exsitRequest = await this.findRequestById(requestId);
		if (exsitRequest)
			return this.friendRequestRepository.update(requestId, { status: response }); //or find & save?
	}

	async findFriends(userLogin: string) {
		const currentUser = await this.findUserByLogin(userLogin);
		let acceptedList = await this.friendRequestRepository.find({
			where: [
				{ creator: currentUser, status: FriendStatus.ACCEPTED },
				// { receiver: user, status: 'accepted' }
			],
			relations: ['creator', 'receiver']
		});

		let friendsList: number[] = [];

		acceptedList.forEach((e) => {
			if (e.creator.login === userLogin)
				friendsList.push(e.receiver.id);
			else if (e.receiver.login === userLogin)
				friendsList.push(e.creator.id);
		});
		return this.userRepository.findByIds(friendsList);
	}

	async blockUser(creatorId: number, receiverId: number) {
		if (creatorId === receiverId)
			throw new Error("You cannot block yourself");
		const receiver = await this.findUserById(receiverId);
		const creator = await this.findUserById(creatorId);
		if (!receiver)
			throw new NotFoundException("User does not exist");
		const request = await this.friendRequestRepository.findOne({
			where: [
				{ creator: creator, receiver: receiver }
			],
			relations: ['creator', 'receiver']
		});
		if (request) {
			return this.friendRequestRepository.update(request, { status: FriendStatus.BLOCKED });
		}
		else {
			const newRequest = this.friendRequestRepository.create({
				creator: creator,
				receiver: receiver,
				status: FriendStatus.BLOCKED
			})
			this.friendRequestRepository.save(newRequest);
		}
	}

	async unblockUser(creatorId: number, receiverId: number) {
		if (creatorId === receiverId)
			throw new Error("You cannot unblock yourself");
		const receiver = await this.findUserById(receiverId);
		const creator = await this.findUserById(creatorId);
		if (!receiver)
			throw new NotFoundException("User does not exist");
		const request = await this.friendRequestRepository.findOne({
			where: [
				{ creator: creator, receiver: receiver, status: FriendStatus.BLOCKED }
			]
		});
		if (request) {
			this.friendRequestRepository.delete(request);
		}
	}

	isUserBlocked(creator: number, receiver: number){
		  const query = this.friendRequestRepository
			.createQueryBuilder("friend")
			.leftJoin('friend.creator', 'creator')
			.leftJoinAndSelect('friend.receiver', 'receiver')
			.where('creator.id = :creatorId')
			.andWhere('receiver.id = :receiverId', { receiverId: receiver })
			.andWhere("friend.status = 'blocked'")
			.setParameters({ creatorId: creator })
			.getCount();

		return (query);
	  }
}
