import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserService } from "src/user/user.service";

@Injectable()
export class TwoFactorStrategy extends PassportStrategy(Strategy, 'two-factor') {
	constructor(
		private readonly userService: UserService
	) {
		super({
			// Retrieve and verify jwt cookie
			jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
				return req?.cookies?.accessToken;
			}]),
			ignoreExpiration: false,
			secretOrKey: 'secret' // need to hide later
		})
	}

	async validate(payload: any) {
		const user = await this.userService.findOneUser(payload.login);
		if (!user.isTwoFactorAuthEnabled) {
			return user;
		}
		if (payload.isSecondFactorAuthenticated) {
			return user;
		}
	}
}
