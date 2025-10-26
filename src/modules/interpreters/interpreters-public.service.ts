import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterInterpreterDto } from './dto/filter-interpreter.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InterpretersPublicService {
  constructor(private prisma: PrismaService) {}

  // 통역사 목록 조회 (승인된 통역사만, 민감정보 제외)
  async findAll(filterDto: FilterInterpreterDto) {
    return this.prisma.interpreter.findMany({
      where: {
        status: 'APPROVED',
        ...(filterDto.language && {
          languages: {
            some: {
              language: { code: filterDto.language },
            },
          },
        }),
        ...(filterDto.specialization && {
          specializations: {
            some: {
              specialization: { name: filterDto.specialization },
            },
          },
        }),
        ...(filterDto.online !== undefined && {
          onlineStatus: filterDto.online,
        }),
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        nationality: true,
        yearsOfExperience: true,
        averageRating: true,
        totalReviews: true,
        onlineStatus: true,
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
      },
    });
  }

  // 통역사 공개 프로필 상세 조회 (민감정보 제외)
  async findPublicProfile(interpreterId: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: {
        id: interpreterId,
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        nationality: true,
        yearsOfExperience: true,
        currentLocation: true,
        averageRating: true,
        totalReviews: true,
        onlineStatus: true,
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
        certifications: {
          select: {
            name: true,
            issuer: true,
            issueDate: true,
            expiryDate: true,
            // documentUrl 제외 (민감정보)
          },
        },
        // user 정보 제외 (phone 등 민감정보)
      },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter not found');
    }

    return interpreter;
  }
}
