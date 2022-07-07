import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-42';
import { AuthService } from '../auth.service';

@Injectable()
export class FtAuthStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly authService: AuthService
	) {
		super({
			clientID: process.env.FT_CLIENT_ID,
			clientSecret: process.env.FT_CLIENT_SECRET,
			callbackURL: process.env.FT_CALLBACK_URL
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: Profile) {
		console.log('Start of 42 auth strategy');
		const { username, photos } = profile;
		const user = {
			login: username,
			username: username,
			avatar: photos[0].value,
			// status: 'offline'
		}
		await this.authService.validateUser(user);
		return user;
	}
}
