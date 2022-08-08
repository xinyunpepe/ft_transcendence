import { Body, Param, Controller, Get, Post, Put, Delete, Req, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserI, UserStatus } from './model/user/user.interface';
import { UserService } from './user.service';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { of } from 'rxjs';
import { join } from 'path';
const fs = require("fs");

export const storage = {
	storage: diskStorage({
		destination: './src/uploads/avatar',
		filename: (req, file, cb) => {

			const filename: string = file.originalname.split('.')[0].replace(/\s/g, '') + uuidv4();
			const extension: string = file.originalname.split('.')[1];

			cb(null, `${filename}.${extension}`)
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

	@Get('username/:username')
	// findOne(@Param() param: { id: number } ) Return the param as an object
	findAllByUsername(
		@Param('username') username: string
	) {
		return this.userService.findAllByUsername(username);
	}

	@Get('avatar/:id')
	async getAvatar(
		@Param('id') id: number,
		@Res() res
	) {
		const user = await this.userService.findUserById(id);
		const avatar = join(process.cwd(), 'src/uploads/avatar/' + user.avatar);
		if (fs.existsSync(avatar)) {
			return of(res.sendFile(avatar));
		}
	}

	@Post()
	createUser(
		@Body() user: UserI
	) {
		return this.userService.createUser(user);
	}

	@UseGuards(JwtAuthGuard)
	@Put('online/:id')
	async putUserOnline(
		@Param('id') id: number
	) {
		const user = await this.userService.findUserById(id);
		await this.userService.onlineStatus(user.id, UserStatus.ON);
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
	uploadAvatar(
		@UploadedFile() file,
		@Req() req
	) {
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
	@Get('friend-request/status/:userId')
	findRequestByUser(
		@Param('userId') userId: number,
		@Req() req
	) {
		return this.userService.findRequestByUser(req.user.id, userId);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/received/pending')
	findRequestByReceiver(
		@Req() req
	) {
		return this.userService.findRequestByReceiver(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/created/pending')
	findRequestsByCreator(
		@Req() req
	) {
		return this.userService.findRequestsByCreator(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/received/accepted')
	findAcceptedRequests(
		@Req() req
	) {
		return this.userService.findAcceptedRequests(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get('friend-request/created/blocked')
	findBlockedRequests(
		@Req() req
	) {
		return this.userService.findBlockedRequests(req.user.id);
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
