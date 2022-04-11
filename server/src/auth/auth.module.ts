import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { FtAuthModule } from './42auth/42auth.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
	imports: [
		FtAuthModule,
	],
	providers: [AuthService],
	controllers: [AuthController]
})

export class AuthModule {}
