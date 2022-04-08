import { Body, Param, Controller, Get, Post } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	findAll(): Promise<User[]> {
		return this.userService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: number): string {
		return `This action returns a #${id} cat`;
	}

	@Post()
	createUser(@Body() user: User): Promise<User> {
		return this.userService.createUser(user);
	}
}
