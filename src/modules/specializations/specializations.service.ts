import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLanguage } from '@prisma/client';
import { LocalizationUtil } from '../../common/utils/localization.util';

@Injectable()
export class SpecializationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userLanguage: AppLanguage) {
    const specializations = await this.prisma.specialization.findMany({
      orderBy: { nameEn: 'asc' },
    });

    return specializations.map((spec) => ({
      id: spec.id,
      name: LocalizationUtil.getLocalizedField(spec, 'name', userLanguage),
    }));
  }
}
