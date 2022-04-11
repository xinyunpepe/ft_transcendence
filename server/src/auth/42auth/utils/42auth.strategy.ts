import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-42';
import { UserService } from 'src/user/user.service'

@Injectable()
export class FtAuthStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly userService: UserService
	) {
		super({
			clientID: process.env.FT_CLIENT_ID,
			clientSecret: process.env.FT_CLIENT_SECRET,
			callbackURL: process.env.FT_CALLBACK_URL,
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) {
		console.log('Start of 42 auth');
		const { username } = profile;
		const user = {
			login: username
		}
		await this.userService.createUser(user);
		console.log('End of 42 auth');
		return cb(null, profile);
	}
}
