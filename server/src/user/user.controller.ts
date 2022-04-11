import { Body, Param, Controller, Get, Post, Put, Delete } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	findAllUser() {
		return this.userService.findAllUser();
	}

	@Get(':id')
	// findOne(@Param() param: { id: number } ) Return the param as an object
	findOneUser(
		@Param('id') id: number
	) {
		return this.userService.findOneUser(id);
	}

	@Post()
	createUser(
		@Body() user: CreateUserDto
	) {
		return this.userService.createUser(user);
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
}
