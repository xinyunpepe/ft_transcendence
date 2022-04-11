import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "src/user/dto/user.dto";
import { User } from "src/user/user.entity";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async validateUser(userDto: CreateUserDto) {
		console.log('Start of validate user');
		const { login } = userDto;
		const user = await this.userService.findOneUser(login);
		if (user) {
			console.log(`${login} login succesfully`);
			this.userService.updateUserStatus(user.login, 'online');
			return user;
		}
		console.log('New user');
		const newUser = await this.userService.createUser(userDto);
		return newUser;
	}

	login(user: User) {
		const payload = { login: user.login };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
