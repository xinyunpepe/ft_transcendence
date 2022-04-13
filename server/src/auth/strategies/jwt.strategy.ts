import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			// Retrieve and verify jwt cookie
			jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
				return req?.cookies?.accessToken;
			}]),
			ignoreExpiration: false,
			secretOrKey: 'secret' // need to hide later
		});
	}

	async validate(payload: any) {
		return {
			login: payload.login,
		};
	}
}
