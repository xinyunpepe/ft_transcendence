import { Body, Param, Controller, Get, Post, Put, Delete, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserI } from './model/user/user.interface';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
// import { uuid } from 'uuidv4';
import path = require('path');

export const storage = {
	storage: diskStorage({
		destination: './src/uploads/avatar',
		filename: (file, cb) => {
			const filename: string = path.parse(file.originalname).name.replace(/\s/g, '');
			const extension: string = path.parse(file.originalname).ext;

			cb(null, `${filename}${extension}`)
		}
	})
}

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) { }

	/*
	** ========== User info ==========
	*/

	@Get()
	findAllUser() {
		return this.userService.findAllUser();
	}

	@Get(':login')
	findUserByLogin(
		@Param('login') login: string
	) {
		return this.userService.findUserByLogin(login);
	}

	@Get('id/:id')
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

	@UseGuards(JwtAuthGuard)
	@Put('username/:id')
	updateUsername(
		@Param('id') id: number,
		@Body() { username }: UserI
	) {
		return this.userService.updateUsername(id, username);
	}

	@UseGuards(JwtAuthGuard)
	@Post('avatar')
	@UseInterceptors(FileInterceptor('file', storage))
	uploadAvatae(
		@UploadedFile() file,
		@Req() req
	) {
		console.log("IN");
		return this.userService.updateAvatar(req.user.id, file.filename)
	}

	@Delete(':id')
	deteleUser(
		@Param('id') id: number
	) {
		return this.userService.deleteUser(id);
	}

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
		@Param('userId') userId: number,
		@Req() req
	) {
		return this.userService.findRequestByUser(req.user, userId);
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
	findRequestsByCreator(
		@Param('creatorId') creatorId: number
	) {
		return this.userService.findRequestsByCreator(creatorId);
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
	@Post('friend-request/block/:receiverId')
	blockUser(
		@Param('receiverId') receiverId: number,
		@Req() req
	) {
		return this.userService.blockUser(req.user.id, receiverId);
	}

	@UseGuards(JwtAuthGuard)
	@Post('friend-request/unblock/:receiverId')
	unblockUser(
		@Param('receiverId') receiverId: number,
		@Req() req
	) {
		return this.userService.unblockUser(req.user.id, receiverId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friends-request/friends')
	findFriends(
		@Req() req
	) {
		return this.userService.findFriends(req.user.login);
	}
}
