import { AppLanguage } from '@prisma/client';

export class LocalizationUtil {
  static getLocalizedField<T>(
    entity: T,
    fieldName: string,
    language: AppLanguage,
  ): string {
    const fieldMap: Record<AppLanguage, string> = {
      UZ: `${fieldName}Uz`,
      RU: `${fieldName}Ru`,
      EN: `${fieldName}En`,
    };

    const localizedField = fieldMap[language];
    return entity[localizedField as keyof T] as string;
  }
}
