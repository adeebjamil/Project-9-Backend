import { Controller, Get, Param, Query, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchStatus, AdminStatus } from './entities/match.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) { }

    @Post('seed')
    @Get('seed')
    seed() {
        return this.matchesService.seed();
    }

    @Post('import-cricapi')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    importFromCricApi() {
        return this.matchesService.importFromCricApi();
    }

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    findAllForAdmin() {
        return this.matchesService.findAllForAdmin();
    }

    @Patch('admin/bulk-status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    bulkUpdateAdminStatus(
        @Body() updateDto: { adminStatus: AdminStatus },
        @Request() req: any,
    ) {
        return this.matchesService.bulkUpdateAdminStatus(
            updateDto.adminStatus,
            req.user.id,
        );
    }

    @Get()
    findAll(@Query('status') status?: MatchStatus) {
        return this.matchesService.findAll(status);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.matchesService.findOne(id);
    }

    @Patch(':id/admin-status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    updateAdminStatus(
        @Param('id') id: string,
        @Body() updateDto: { adminStatus: AdminStatus; adminNote?: string },
        @Request() req: any,
    ) {
        return this.matchesService.updateAdminStatus(
            id,
            updateDto.adminStatus,
            updateDto.adminNote || '',
            req.user.id,
        );
    }
}
