import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { History } from './entities/history.entity';
import { HistoryService } from './history/history.service';
import { HistoryController } from './history/history.controller';
import { Match } from './entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([History, Match])
  ]
  ,providers: [GameGateway, HistoryService], 
  controllers: [HistoryController]
})
export class GameModule {}
