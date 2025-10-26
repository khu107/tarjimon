import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InterpretersService } from './interpreters.service';
import { UpdateInterpreterDto } from './dto/update-interpreter.dto';
import { AddSpecializationDto } from './dto/add-specialization.dto';
import { AddCertificationDto } from './dto/add-certification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/jwt-payload.type';
import { Role } from '@prisma/client';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddLanguageDto } from './dto/add-language.dto';
import { InterpretersPublicService } from './interpreters-public.service';
import { FilterInterpreterDto } from './dto/filter-interpreter.dto';

@ApiTags('Interpreters')
@Controller('interpreters')
export class InterpretersController {
  constructor(
    private readonly interpretersService: InterpretersService,
    private readonly publicService: InterpretersPublicService,
  ) {}

  // ==================== 공개 API (일반 사용자용) ====================

  @Get()
  @ApiOperation({ summary: 'Get interpreters list (with filters)' })
  async findAll(@Query() filterDto: FilterInterpreterDto) {
    return this.publicService.findAll(filterDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile (Interpreter only)' })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.interpretersService.findOne(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interpreter public profile' })
  async findPublicProfile(@Param('id') id: string) {
    return this.publicService.findPublicProfile(id);
  }

  // ==================== 통역사 전용 API ====================

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile (Interpreter only)' })
  async updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateInterpreterDto: UpdateInterpreterDto,
  ) {
    return this.interpretersService.update(user.userId, updateInterpreterDto);
  }

  @Post('me/languages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add language (Interpreter only)' })
  async addLanguage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() addLanguageDto: AddLanguageDto,
  ) {
    return this.interpretersService.addLanguage(user.userId, addLanguageDto);
  }

  @Delete('me/languages/:languageCode')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove language (Interpreter only)' })
  async removeLanguage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('languageCode') languageCode: string,
  ) {
    return this.interpretersService.removeLanguage(user.userId, languageCode);
  }

  @Post('me/specializations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add specialization (Interpreter only)' })
  async addSpecialization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() addSpecializationDto: AddSpecializationDto,
  ) {
    return this.interpretersService.addSpecialization(
      user.userId,
      addSpecializationDto,
    );
  }

  @Delete('me/specializations/:specializationName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove specialization (Interpreter only)' })
  async removeSpecialization(
    @CurrentUser() user: AuthenticatedUser,
    @Param('specializationName') specializationName: string,
  ) {
    return this.interpretersService.removeSpecialization(
      user.userId,
      specializationName,
    );
  }

  @Post('me/certifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add certification (Interpreter only)' })
  async addCertification(
    @CurrentUser() user: AuthenticatedUser,
    @Body() addCertificationDto: AddCertificationDto,
  ) {
    return this.interpretersService.addCertification(
      user.userId,
      addCertificationDto,
    );
  }

  @Delete('me/certifications/:certificationId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.INTERPRETER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove certification (Interpreter only)' })
  async removeCertification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('certificationId') certificationId: string,
  ) {
    return this.interpretersService.removeCertification(
      user.userId,
      certificationId,
    );
  }
}
