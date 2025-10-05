import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

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

  // findAll() {
  //   return `This action returns all users`;
  // }

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
            birthDate: true,
            nationality: true,
          },
        },
      },
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { name, birthDate, nationality, avatarUrl } = updateProfileDto;

    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        name,
        birthDate: new Date(birthDate),
        nationality,
        ...(avatarUrl && { avatarUrl }),
      },
    });
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
