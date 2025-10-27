import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppLanguage } from '@prisma/client';
import { LocalizationUtil } from '../../common/utils/localization.util';

@Injectable()
export class LanguagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userLanguage: AppLanguage) {
    const languages = await this.prisma.language.findMany({
      orderBy: { code: 'asc' },
    });

    return languages.map((lang) => ({
      id: lang.id,
      code: lang.code,
      name: LocalizationUtil.getLocalizedField(lang, 'name', userLanguage),
    }));
  }
}
