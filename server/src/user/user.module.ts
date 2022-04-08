import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  providers: [UserService],
  controllers: [UserController],

  // To use outside of module which imported TypeOrmModule.forFeature
  exports: [TypeOrmModule]
})
export class UserModule {}
