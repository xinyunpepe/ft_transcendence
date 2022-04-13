import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { toFileStream } from 'qrcode';
import { Response } from "express";
import { authenticator } from "otplib";
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
			console.log(`${ login } login succesfully`);
			// await this.userService.updateUserStatus(user.login, 'online');
			// console.log(`${ user.login } is ${ user.status } now`);
			return user;
		}
		console.log('New user');
		const newUser = await this.userService.createUser(userDto);
		// await this.userService.updateUserStatus(newUser.login, 'online');
		// console.log(`${ newUser.login } is ${ newUser.status } now`);
		return newUser;
	}

	login(user: User) {
		console.log('Start creating token');
		const payload = { login: user.login };
		return {
			access_token: this.jwtService.sign(payload)
		};
	}

	loginWithTwoFactorAuth(user: User, isSecondFactorAuthenticated = false) {
		console.log('Start creating token');
		const payload = { login: user.login, isSecondFactorAuthenticated };
		return {
			access_token: this.jwtService.sign(payload)
		};
	}

	// Generate 2FA secret and save to database
	async generateTwoFactorAuthSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.login, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);
		await this.userService.setTwoFactorAuthSecret(secret, user.login);
		return otpauthUrl;
	}

	// Generate QRcode to serve the otpauth Url
	async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		stream.setHeader('Content-type', 'image/png');
		return toFileStream(stream, otpauthUrl);
	}

	// Verify user's code against the secret saved in the database
	isTwoFactorAuthCodeValid(twoFactorAuthCode: string, user: User) {
		console.log('Checking if 2fa code is valid');
		console.log(twoFactorAuthCode);
		console.log(user.twoFactorAuthSecret);
		return authenticator.verify({
			token: twoFactorAuthCode,
			secret: user.twoFactorAuthSecret
		});
	}
}
