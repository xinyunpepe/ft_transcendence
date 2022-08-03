import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { FtAuthStrategy } from './strategies/42auth.strategy';
import { SessionSerializer } from './utils/session.serializer';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TwoFactorStrategy } from './strategies/2fa.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
	imports: [
		UserModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
				signOptions: { expiresIn: '10000s' }
			})
		})
	],
	providers: [
		AuthService,
		UserService,
		FtAuthStrategy,
		SessionSerializer,
		JwtStrategy,
		TwoFactorStrategy
	],
	controllers: [AuthController],
	exports: [AuthService]
})
export class AuthModule {}
