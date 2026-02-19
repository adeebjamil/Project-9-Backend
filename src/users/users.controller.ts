
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Req() req: any, @Body() createUserDto: any) {
        if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Access denied: Admins only');
        return this.usersService.create(createUserDto);
    }

    @Get()
    async findAll(@Req() req: any) {
        if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Access denied: Admins only');
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Req() req: any, @Param('id') id: string) {
        if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Access denied: Admins only');
        return this.usersService.findById(id);
    }

    @Patch(':id')
    async update(@Req() req: any, @Param('id') id: string, @Body() updateDto: any) {
        if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Access denied: Admins only');
        return this.usersService.update(id, updateDto);
    }

    @Delete(':id')
    async remove(@Req() req: any, @Param('id') id: string) {
        if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Access denied: Admins only');
        if (req.user.id === id) throw new ForbiddenException('Cannot delete your own account');
        return this.usersService.remove(id);
    }

    @Patch(':id/suspend')
    async suspend(@Req() req: any, @Param('id') id: string, @Body() body: { suspended: boolean }) {
        if (req.user.role !== UserRole.ADMIN) throw new ForbiddenException('Access denied: Admins only');
        if (req.user.id === id) throw new ForbiddenException('Cannot suspend your own account');
        return this.usersService.setSuspended(id, body.suspended);
    }
}

