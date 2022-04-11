import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { Profile } from 'passport-42';

@Injectable()
export class SessionSerializer extends PassportSerializer {

	// Serialize user(eg. login) before saving to the session
	// what is done?
	serializeUser(user: Profile,  done: (err: Error, user: Profile) => void) {
		done(null, user);
	}

	// Deserialize user before coming out from the session
	deserializeUser(payload: Profile, done: (err: Error, user: Profile) => void) {
		return done(null, payload);
	}
}
