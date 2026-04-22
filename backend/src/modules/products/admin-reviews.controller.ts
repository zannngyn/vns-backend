import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Reviews')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews with associated products and users' })
  async findAll() {
    return this.prisma.review.findMany({
      include: { 
        product: { select: { name: true, thumbnail: true } },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true, fullName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a toxic or spam review' })
  async delete(@Param('id') id: string) {
    return this.prisma.review.delete({
      where: { id: BigInt(id) }
    });
  }
}
