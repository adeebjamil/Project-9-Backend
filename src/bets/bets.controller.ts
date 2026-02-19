
import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { GameEngineService } from '../game-engine/game-engine.service';

@UseGuards(JwtAuthGuard)
@Controller('bets')
export class BetsController {
  constructor(
    private readonly betsService: BetsService,
    private readonly gameEngine: GameEngineService,
  ) { }

  @Post('settle')
  settle(@Request() req: any, @Body() body: { winningSelectionId: string }) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can settle bets');
    }
    return this.betsService.settle(body.winningSelectionId);
  }

  @Get('admin/match-stats')
  getMatchBetStats(@Request() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view bet stats');
    }
    return this.betsService.getMatchBetStats();
  }

  @Post('place')
  create(@Request() req: any, @Body() createBetDto: CreateBetDto) {
    return this.betsService.create(req.user.userId || req.user.id, createBetDto);
  }

  @Get('engine/config')
  getEngineConfig(@Request() req: any) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can view engine config');
    }
    return this.gameEngine.getEngineConfig();
  }

  @Get('my')
  findMyBets(@Request() req: any) {
    return this.betsService.findAll(req.user.userId || req.user.id);
  }

  @Get('exposure')
  async getExposure(@Request() req: any) {
    const exposure = await this.betsService.getExposure(req.user.userId || req.user.id);
    return { exposure };
  }

  @Get()
  findAll(@Request() req: any) {
    return this.betsService.findAll(req.user.userId || req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.betsService.findOne(id, req.user.userId || req.user.id);
  }
}
