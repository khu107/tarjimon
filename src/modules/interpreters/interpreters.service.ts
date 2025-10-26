import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateInterpreterDto } from './dto/update-interpreter.dto';
import { AddLanguageDto } from './dto/add-language.dto';
import { AddSpecializationDto } from './dto/add-specialization.dto';
import { AddCertificationDto } from './dto/add-certification.dto';

@Injectable()
export class InterpretersService {
  constructor(private prisma: PrismaService) {}

  // 통역사 프로필 조회
  async findOne(userId: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
      include: {
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
        certifications: true,
        user: {
          select: {
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    return interpreter;
  }

  // 통역사 프로필 업데이트 (상세 정보)
  async update(userId: string, updateInterpreterDto: UpdateInterpreterDto) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    return await this.prisma.interpreter.update({
      where: { userId },
      data: updateInterpreterDto,
      include: {
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
        certifications: true,
      },
    });
  }

  // 언어 추가
  async addLanguage(userId: string, addLanguageDto: AddLanguageDto) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    const language = await this.prisma.language.findUnique({
      where: { code: addLanguageDto.languageCode },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    try {
      await this.prisma.interpreterLanguage.create({
        data: {
          interpreterId: interpreter.id,
          languageId: language.id,
        },
      });
    } catch (error) {
      throw new BadRequestException('Language already added');
    }

    return { success: true, message: 'Language added successfully' };
  }

  // 언어 제거
  async removeLanguage(userId: string, languageCode: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    const language = await this.prisma.language.findUnique({
      where: { code: languageCode },
    });

    if (!language) {
      throw new NotFoundException('Language not found');
    }

    const deleted = await this.prisma.interpreterLanguage.deleteMany({
      where: {
        interpreterId: interpreter.id,
        languageId: language.id,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException('Language not found in interpreter profile');
    }

    return { success: true, message: 'Language removed successfully' };
  }

  // 전문분야 추가
  async addSpecialization(
    userId: string,
    addSpecializationDto: AddSpecializationDto,
  ) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    const specialization = await this.prisma.specialization.findUnique({
      where: { name: addSpecializationDto.specializationName },
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    try {
      await this.prisma.interpreterSpecialization.create({
        data: {
          interpreterId: interpreter.id,
          specializationId: specialization.id,
        },
      });
    } catch (error) {
      throw new BadRequestException('Specialization already added');
    }

    return { success: true, message: 'Specialization added successfully' };
  }

  // 전문분야 제거
  async removeSpecialization(userId: string, specializationName: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    const specialization = await this.prisma.specialization.findUnique({
      where: { name: specializationName },
    });

    if (!specialization) {
      throw new NotFoundException('Specialization not found');
    }

    const deleted = await this.prisma.interpreterSpecialization.deleteMany({
      where: {
        interpreterId: interpreter.id,
        specializationId: specialization.id,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException(
        'Specialization not found in interpreter profile',
      );
    }

    return { success: true, message: 'Specialization removed successfully' };
  }

  // 자격증 추가
  async addCertification(
    userId: string,
    addCertificationDto: AddCertificationDto,
  ) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    return await this.prisma.certification.create({
      data: {
        interpreterId: interpreter.id,
        ...addCertificationDto,
      },
    });
  }

  // 자격증 제거
  async removeCertification(userId: string, certificationId: string) {
    const interpreter = await this.prisma.interpreter.findUnique({
      where: { userId },
    });

    if (!interpreter) {
      throw new NotFoundException('Interpreter profile not found');
    }

    const certification = await this.prisma.certification.findUnique({
      where: { id: certificationId },
    });

    if (!certification || certification.interpreterId !== interpreter.id) {
      throw new NotFoundException('Certification not found');
    }

    await this.prisma.certification.delete({
      where: { id: certificationId },
    });

    return { success: true, message: 'Certification removed successfully' };
  }
}
