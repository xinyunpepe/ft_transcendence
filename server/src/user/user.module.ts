import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './model/user/user.entity';
import { FriendRequestEntity } from './model/friend-request/friend-request.entity';
import { MatchHistoryEntity } from './model/match-history/match-history.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserEntity,
			FriendRequestEntity,
			MatchHistoryEntity
		])
	],
	providers: [UserService],
	controllers: [UserController],

	// To use outside of module which imported TypeOrmModule.forFeature
	exports: [UserService, TypeOrmModule]
})
export class UserModule {}
