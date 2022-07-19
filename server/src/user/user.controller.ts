import { Body, Param, Controller, Get, Post, Put, Delete, Req, Query } from '@nestjs/common';
import { FriendRequestStatus } from './model/friend-request/friend-request.interface';
import { UpdateUserDto } from './model/user/user.dto';
import { UserI } from './model/user/user.interface';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	/*
	** ========== User info ==========
	*/

	@Get()
	findAllUser() {
		return this.userService.findAllUser();
	}

	@Get(':login')
	// findOne(@Param() param: { id: number } ) Return the param as an object
	findUserByLogin(
		@Param('login') login: string
	) {
		return this.userService.findUserByLogin(login);
	}

	@Get('/id/:id')
	findUserById(
		@Param('id') id: number
	) {
		return this.userService.findUserById(id);
	}

	@Get('/username/:username')
	// findOne(@Param() param: { id: number } ) Return the param as an object
	findAllByUsername(
		@Param('username') username: string
	) {
		return this.userService.findAllByUsername(username);
	}

	@Post()
	createUser(
		@Body() user: UserI
	) {
		return this.userService.createUser(user);
	}

	@Put(':login')
	updateUserName(
		@Param('login') login: string,
		@Body() { username }: UpdateUserDto
	) {
		return this.userService.updateUserName(login, username);
	}

	@Put(':login')
	updateUserAvatar(
		@Param('login') login: string,
		@Body() { avatar }: UpdateUserDto
	) {
		return this.userService.updateUserName(login, avatar);
	}

	@Put(':id')
	updateUser(
		@Param('id') id: number,
		@Body() user: UpdateUserDto
	) {
		return this.userService.updateUser(id, user);
	}

	@Delete(':id')
	deteleUser(
		@Param('id') id: number
	) {
		return this.userService.deleteUser(id);
	}

	// @Get('status/:login')
	// getUserStatus(
	// 	@Param('login') login: string,
	// ) {
	// 	return this.userService.getUserStatus(login);
	// }

	/*
	** ========== Friend request ==========
	*/

	@Get('friend-request/:requestId')
	findRequestById(
		@Param('requestId') requestId: number
	) {
		return this.userService.findRequestById(requestId);
	}

	@Get('friend-request/receiver/:receiverLogin')
	findRequestByReceiver(
		@Param('receiverLogin') receiverLogin: string
	) {
		return this.userService.findRequestByReceiver(receiverLogin);
	}

	@Get('friend-request/creator/:creatorLogin')
	findRequestByCreator(
		@Param('creatorLogin') creatorLogin: string
	) {
		return this.userService.findRequestByCreator(creatorLogin);
	}

	@Post('friend-request/send/:receiverLogin')
	sendFriendRequest(
		@Param('receiverLogin') receiverLogin: string,
		@Req() req
	) {
		return this.userService.sendFriendRequest(req.user.login, receiverLogin);
	}

	@Put('friend-request/response/:requestId')
	responseToFriendRequest(
		@Param('requestId') requestId: number,
		@Body() response: FriendRequestStatus
	) {
		return this.userService.responseToFriendRequest(requestId, response.status);
	}

	@Get('friends-request/friends')
	findFriends(
		@Req() req
	) {
		// console.log(req.user);
		return this.userService.findFriends(req.user.login);
	}
}
