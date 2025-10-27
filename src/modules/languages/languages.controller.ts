// src/modules/languages/languages.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'; // 🆕 추가
import { LanguagesService } from './languages.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.type';

@ApiTags('Languages')
@Controller('languages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all languages (localized)' })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.languagesService.findAll(user.appLanguage);
  }
}
