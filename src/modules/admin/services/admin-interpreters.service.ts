import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AdminFilterInterpreterDto } from '../dto/admin-filter-interpreter.dto';
import { ApproveInterpreterDto } from '../dto/approve-interpreter.dto';
import { RejectInterpreterDto } from '../dto/reject-interpreter.dto';
import { SuspendInterpreterDto } from '../dto/suspend-interpreter.dto';
import { InterpreterStatus, UserStatus } from '@prisma/client';

@Injectable()
export class AdminInterpretersService {
  constructor(private prisma: PrismaService) {}

  // 1. 모든 통역사 목록 조회 (필터링)
  async findAll(filterDto: AdminFilterInterpreterDto) {
    return this.prisma.interpreter.findMany({
      where: {
        // 상태 필터 (선택사항)
        ...(filterDto.status && { status: filterDto.status }),
        // 검색 필터 (이름 or 전화번호)
        ...(filterDto.search && {
          OR: [
            { name: { contains: filterDto.search } },
            { user: { phone: { contains: filterDto.search } } },
          ],
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            status: true,
            createdAt: true,
          },
        },
        languages: {
          include: {
            language: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true,
              },
            },
          },
        },
        certifications: true,
      },
      orderBy: {
        createdAt: 'desc', // 최신순
      },
    });
  }

  // 2. 승인 대기 통역사 목록  가장 중요!
  async findPendingApprovals() {
    return this.prisma.interpreter.findMany({
      where: {
        status: InterpreterStatus.PENDING_APPROVAL,
      },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            createdAt: true,
          },
        },
        languages: {
          include: {
            language: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        specializations: {
          include: {
            specialization: {
              select: {
                name: true,
              },
            },
          },
        },
        certifications: true,
      },
      orderBy: {
        createdAt: 'asc', // 오래된 것부터 (먼저 신청한 사람부터)
      },
    });
  }

  // 3. 통역사 상세 조회 (모든 정보)
  async findOne(interpreterId: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { id: interpreterId },
      include: {
        user: true, // 전화번호 등 모든 정보
        languages: {
          include: {
            language: true,
          },
        },
        specializations: {
          include: {
            specialization: true,
          },
        },
        certifications: true, // ✅ documentUrl 포함
      },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter not found');
    }

    return interpreter;
  }

  // 4. 통역사 승인
  async approve(interpreterId: string, approveDto: ApproveInterpreterDto) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { id: interpreterId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter not found');
    }

    if (interpreter.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException(
        'Only pending interpreters can be approved',
      );
    }

    // 통역사 상태 변경 + 사용자 상태도 ACTIVE로
    return this.prisma.interpreter.update({
      where: { id: interpreterId },
      data: {
        status: InterpreterStatus.APPROVED,
        user: {
          update: {
            status: UserStatus.ACTIVE,
          },
        },
      },
      include: {
        user: true,
        languages: {
          include: {
            language: true,
          },
        },
        specializations: {
          include: {
            specialization: true,
          },
        },
      },
    });
  }

  // 5. 통역사 거절 ⭐
  async reject(interpreterId: string, rejectDto: RejectInterpreterDto) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { id: interpreterId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter not found');
    }

    if (interpreter.status !== InterpreterStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Only pending interpreters can be rejected',
      );
    }

    // 통역사 상태 변경
    return this.prisma.interpreter.update({
      where: { id: interpreterId },
      data: {
        status: InterpreterStatus.REJECTED,
        // TODO: 나중에 Prisma 스키마에 rejectionReason 필드 추가하면
        // rejectionReason: rejectDto.reason,
      },
      include: {
        user: true,
      },
    });
  }

  // 6. 통역사 정지 ⭐
  async suspend(interpreterId: string, suspendDto: SuspendInterpreterDto) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { id: interpreterId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter not found');
    }

    // 사용자 상태를 SUSPENDED로 변경 + 강제 오프라인
    return this.prisma.interpreter.update({
      where: { id: interpreterId },
      data: {
        onlineStatus: false, // 강제 오프라인
        user: {
          update: {
            status: UserStatus.SUSPENDED,
          },
        },
      },
      include: {
        user: true,
      },
    });
  }

  // 7. 통역사 정지 해제
  async unsuspend(interpreterId: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { id: interpreterId },
      include: {
        user: true,
      },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter not found');
    }

    if (interpreter.user.status !== UserStatus.SUSPENDED) {
      throw new BadRequestException('Interpreter is not suspended');
    }

    // 사용자 상태를 ACTIVE로 복구
    return this.prisma.interpreter.update({
      where: { id: interpreterId },
      data: {
        user: {
          update: {
            status: UserStatus.ACTIVE,
          },
        },
      },
      include: {
        user: true,
      },
    });
  }

  // 8. 통계 정보 (대시보드용)
  async getStatistics() {
    const [total, approved, pending, rejected] = await Promise.all([
      this.prisma.interpreter.count(),
      this.prisma.interpreter.count({
        where: { status: InterpreterStatus.APPROVED },
      }),
      this.prisma.interpreter.count({
        where: { status: InterpreterStatus.PENDING_APPROVAL },
      }),
      this.prisma.interpreter.count({
        where: { status: InterpreterStatus.REJECTED },
      }),
    ]);

    return {
      total,
      approved,
      pending,
      rejected,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(2) : 0,
    };
  }
}
