import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SpecializationsService } from './specializations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.type';

@ApiTags('Specializations')
@Controller('specializations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SpecializationsController {
  constructor(
    private readonly specializationsService: SpecializationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all specializations (localized)' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.specializationsService.findAll(user.appLanguage);
  }
}
