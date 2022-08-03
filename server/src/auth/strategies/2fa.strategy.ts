import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from "src/user/user.service";

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'two-factor') {
	constructor(
		private readonly userService: UserService,
		private readonly configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET')
		})
	}

	async validate(payload: any) {
		const user = await this.userService.findUserByLogin(payload.login);
		if (!user.isTwoFactorAuthEnabled) {
			return user;
		}
		if (payload.isSecondFactorAuthenticated) {
			return user;
		}
	}
}
