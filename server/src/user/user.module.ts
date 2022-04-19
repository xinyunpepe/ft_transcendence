import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { FriendRequestEntity } from './entities/friend-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity
    ])
  ],
  providers: [UserService],
  controllers: [UserController],

  // To use outside of module which imported TypeOrmModule.forFeature
  exports: [TypeOrmModule]
})
export class UserModule {}
