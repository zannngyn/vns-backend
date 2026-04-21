import { Controller, Get } from '@nestjs/common';
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
        orders: { select: { totalAmount: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
