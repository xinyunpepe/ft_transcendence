import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { History } from './entities/history.entity';
import { HistoryService } from './history/history.service';
import { HistoryController } from './history/history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([History])
  ]
  ,providers: [GameGateway, HistoryService], 
  controllers: [HistoryController]
})
export class GameModule {}
