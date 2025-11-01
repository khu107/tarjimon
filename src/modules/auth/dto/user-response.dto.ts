import { Role, UserStatus, AppLanguage, User } from '@prisma/client';

export class UserResponseDto {
  id: string;
  role: Role;
  phone: string | null;
  status: UserStatus;
  appLanguage: AppLanguage;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      role: user.role,
      phone: user.phone,
      status: user.status,
      appLanguage: user.appLanguage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
