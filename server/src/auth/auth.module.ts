import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { FtAuthStrategy } from './strategies/42auth.strategy';
import { SessionSerializer } from './utils/session.serializer';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorStrategy } from './strategies/2fa.strategy';

@Module({
	imports: [
		UserModule,
		JwtModule.register({
			// secret: process.env.JWT_SECRET,
			secret: 'secret', // need to hide later
			signOptions: { expiresIn: '7d' },
		}),
	],
	providers: [
		AuthService,
		UserService,
		FtAuthStrategy,
		SessionSerializer,
		JwtStrategy,
		TwoFactorStrategy
	],
	controllers: [AuthController]
})

export class AuthModule {}
