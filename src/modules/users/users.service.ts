import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AppLanguage } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findByPhone(createUserDto.phone);

    if (existingUser) {
      throw new BadRequestException('Phone number already registered');
    }

    return this.prisma.user.create({
      data: { ...createUserDto, authProvider: 'SMS' },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: { phone },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        authProvider: true,
        userProfile: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            nationality: true,
          },
        },
      },
    });
  }

  async updateLanguage(userId: string, appLanguage: AppLanguage) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { appLanguage },
      select: {
        id: true,
        appLanguage: true,
        role: true,
        phone: true,
        status: true,
      },
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { name, nationality, avatarUrl } = updateProfileDto;

    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        name,
        nationality,
        ...(avatarUrl && { avatarUrl }),
      },
    });
  }
}
