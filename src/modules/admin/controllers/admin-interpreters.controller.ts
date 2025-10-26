import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AdminInterpretersService } from '../services/admin-interpreters.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AdminFilterInterpreterDto } from '../dto/admin-filter-interpreter.dto';
import { ApproveInterpreterDto } from '../dto/approve-interpreter.dto';
import { RejectInterpreterDto } from '../dto/reject-interpreter.dto';
import { SuspendInterpreterDto } from '../dto/suspend-interpreter.dto';

@ApiTags('Admin - Interpreters')
@Controller('admin/interpreters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminInterpretersController {
  constructor(
    private readonly adminInterpretersService: AdminInterpretersService,
  ) {}

  // 1. 모든 통역사 목록 조회
  @Get()
  @ApiOperation({ summary: 'Get all interpreters (Admin)' })
  async findAll(@Query() filterDto: AdminFilterInterpreterDto) {
    return this.adminInterpretersService.findAll(filterDto);
  }

  // 2. 승인 대기 통역사 목록  가장 중요!
  @Get('pending')
  @ApiOperation({ summary: 'Get pending approval interpreters' })
  async findPendingApprovals() {
    return this.adminInterpretersService.findPendingApprovals();
  }

  // 3. 통계 정보
  @Get('statistics')
  @ApiOperation({ summary: 'Get interpreter statistics' })
  async getStatistics() {
    return this.adminInterpretersService.getStatistics();
  }

  // 4. 통역사 상세 조회
  @Get(':id')
  @ApiOperation({ summary: 'Get interpreter detail (all info)' })
  @ApiParam({ name: 'id', description: 'Interpreter ID' })
  async findOne(@Param('id') id: string) {
    return this.adminInterpretersService.findOne(id);
  }

  // 5. 통역사 승인
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve interpreter' })
  @ApiParam({ name: 'id', description: 'Interpreter ID' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveInterpreterDto,
  ) {
    return this.adminInterpretersService.approve(id, approveDto);
  }

  // 6. 통역사 거절
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject interpreter' })
  @ApiParam({ name: 'id', description: 'Interpreter ID' })
  async reject(
    @Param('id') id: string,
    @Body() rejectDto: RejectInterpreterDto,
  ) {
    return this.adminInterpretersService.reject(id, rejectDto);
  }

  // 7. 통역사 정지
  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend interpreter' })
  @ApiParam({ name: 'id', description: 'Interpreter ID' })
  async suspend(
    @Param('id') id: string,
    @Body() suspendDto: SuspendInterpreterDto,
  ) {
    return this.adminInterpretersService.suspend(id, suspendDto);
  }

  // 8. 통역사 정지 해제
  @Patch(':id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend interpreter' })
  @ApiParam({ name: 'id', description: 'Interpreter ID' })
  async unsuspend(@Param('id') id: string) {
    return this.adminInterpretersService.unsuspend(id);
  }
}
