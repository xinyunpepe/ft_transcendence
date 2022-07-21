import { Body, Param, Controller, Get, Post, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FriendStatus } from './model/friend-request/friend-request.interface';
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

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/:requestId')
	findRequestById(
		@Param('requestId') requestId: number
	) {
		return this.userService.findRequestById(requestId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/status/:receiverId')
	findRequestByUser(
		@Param('receiverId') receiverId: number,
		@Req() req
	) {
		return this.userService.findRequestByUser(req.user, receiverId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/receiver/:receiverId')
	findRequestByReceiver(
		@Param('receiverId') receiverId: number
	) {
		return this.userService.findRequestByReceiver(receiverId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/creator/:creatorId')
	findRequestByCreator(
		@Param('creatorId') creatorId: number
	) {
		return this.userService.findRequestByCreator(creatorId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('friend-request/send/:receiverId')
	sendFriendRequest(
		@Param('receiverId') receiverId: number,
		@Req() req
	) {
		return this.userService.sendFriendRequest(req.user.id, receiverId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('friend-request/remove/:receiverId')
	removeFriendRequest(
		@Param('receiverId') receiverId: number,
		@Req() req
	) {
		return this.userService.removeFriendRequest(req.user.id, receiverId);
	}

	@UseGuards(JwtAuthGuard)
	@Put('friend-request/response/:requestId')
	responseToFriendRequest(
		@Param('requestId') requestId: number,
		@Req() req
	) {
		return this.userService.responseToFriendRequest(requestId, req.body.response);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friends-request/friends')
	findFriends(
		@Req() req
	) {
		// console.log(req.user);
		return this.userService.findFriends(req.user.login);
	}
}
