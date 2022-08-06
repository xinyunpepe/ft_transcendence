import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { toFile } from 'qrcode';
import { authenticator } from "otplib";
import { UserEntity } from "src/user/model/user/user.entity";
import { UserService } from "src/user/user.service";
import { UserI } from "src/user/model/user/user.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async validateUser(userI: UserI) {
		const user = await this.userService.findUserByLogin(userI.login);
		if (user) {
			return user;
		}
		const newUser = await this.userService.createUser(userI);
		return newUser;
	}

	login(user: UserI) {
		// TODO +1?
		return {
			access_token: this.jwtService.sign({ user })
		};
	}

	loginWithTwoFactorAuth(user: UserEntity, isSecondFactorAuthenticated = false) {
		const payload = { login: user.login, isSecondFactorAuthenticated };
		return {
			access_token: this.jwtService.sign(payload, {
				secret: this.configService.get('JWT_SECRET'),
				expiresIn: '10000s'
			})
		};
	}

	// Generate 2FA secret and save to database
	async generateTwoFactorAuthSecret(user: UserEntity) {
		const secret = authenticator.generateSecret();
		const otpauthUrl = authenticator.keyuri(user.login, process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME, secret);
		await this.userService.setTwoFactorAuthSecret(secret, user.id);
		return otpauthUrl;
	}

	// Generate QRcode to serve the otpauth Url
	// Generate QRcode and save as local file
	async pipeQrCodeStream(otpauthUrl: string) {
		// stream.setHeader('Content-type', 'image/png');
		// return toFileStream(stream, otpauthUrl);

		toFile('src/uploads/qrcode/qrcode.png',otpauthUrl);
	}

	// Verify user's code against the secret saved in the database
	isTwoFactorAuthCodeValid(twoFactorAuthCode: string, user: UserEntity) {
		return authenticator.verify({
			token: twoFactorAuthCode,
			secret: user.twoFactorAuthSecret
		});
	}

	// Verify if jwt is valid before connection, need to verify is user exists???
	verifyJwt(jwt: string) {
		return this.jwtService.verifyAsync(jwt);
	}
}
