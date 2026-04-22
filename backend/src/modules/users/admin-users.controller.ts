import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return this.prisma.user.findMany({
      include: { 
        profile: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle user active status (Ban/Unban)' })
  async toggleStatus(@Param('id') id: string, @Body() data: { isActive: boolean }) {
    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { isActive: data.isActive }
    });
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change user role' })
  async updateRole(@Param('id') id: string, @Body() data: { role: Role }) {
    return this.prisma.user.update({
      where: { id: BigInt(id) },
      data: { role: data.role }
    });
  }
}
