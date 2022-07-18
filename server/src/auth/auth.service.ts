import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { toFileStream } from 'qrcode';
import { Response } from "express";
import { authenticator } from "otplib";
import { UserEntity } from "src/user/model/user/user.entity";
import { UserService } from "src/user/user.service";
import { UserI } from "src/user/model/user/user.interface";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService
	) {}

	async validateUser(userI: UserI) {
		console.log('Start of validate user');
		const user = await this.userService.findUserByLogin(userI.login);
		if (user) {
			console.log('User exists in the database');
			// await this.userService.updateUserStatus(user.login, 'online');
			// console.log(`${ user.login } is ${ user.status } now`);
			return user;
		}
		console.log('New user');
		const newUser = await this.userService.createUser(userI);
		// await this.userService.updateUserStatus(newUser.login, 'online');
		// console.log(`${ newUser.login } is ${ newUser.status } now`);
		return newUser;
	}

	login(user: UserI) {
		console.log('Start creating token');
		return {
			access_token: this.jwtService.sign({ user })
		};
	}

	loginWithTwoFactorAuth(user: UserEntity, isSecondFactorAuthenticated = false) {
		console.log('Start creating 2FA token');
		const payload = { login: user.login, isSecondFactorAuthenticated };
		return {
			access_token: this.jwtService.sign(payload)
		};
	}

	// Generate 2FA secret and save to database
	async generateTwoFactorAuthSecret(user: UserEntity) {
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
	isTwoFactorAuthCodeValid(twoFactorAuthCode: string, user: UserEntity) {
		console.log('Checking if 2fa code is valid');
		return authenticator.verify({
			token: twoFactorAuthCode,
			secret: user.twoFactorAuthSecret
		});
	}

	// Verify if jwt is valid before connection, need to verify is user exists???
	verifyJwt(jwt: string) {
		return this.jwtService.verifyAsync(jwt);
	}

	// logout(user: UserEntity) {
	// 	console.log('Start logging out');
	// 	this.userService.updateUserStatus(user.login, 'offline');
	// }
}
