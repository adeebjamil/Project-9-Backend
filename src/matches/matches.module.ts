
import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { CricketApiService } from './cricket-api.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    controllers: [MatchesController],
    providers: [MatchesService, CricketApiService],
    exports: [MatchesService],
})
export class MatchesModule { }
